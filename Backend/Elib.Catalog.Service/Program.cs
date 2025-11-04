using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Messaging.Consumers;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Profiles;
using Elib.Catalog.Service.Repositories;
using Elib.Catalog.Service.Services;
using Elib.Catalog.Service.Controllers;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.ModelBuilder;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using SharedLibrary.Repositories;
using SharedLibrary.Messages;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();


builder.Services.AddDbContext<CatalogDb>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(SubjectProfiles).Assembly);
    cfg.AddMaps(typeof(DocumentProfile).Assembly);
    cfg.AddMaps(typeof(CategoryProfile).Assembly);
});

builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IViewTrackingService, ViewTrackingService>();
builder.Services.AddScoped<EnrichDocumentUserNamesFilter>();

builder.Services.AddControllers().AddJsonOptions(options
=> options.JsonSerializerOptions.PropertyNamingPolicy = null);

// In-memory cache for view tracking (1 user = 1 view/day)
builder.Services.AddMemoryCache();

builder.Services.AddJwtAuthSwagger();


var modelBuilder = new ODataConventionModelBuilder();
modelBuilder.EntitySet<AdminDocumentListDTO>("Documents");
modelBuilder.EntitySet<CategoryReadDTO>("Categories");
modelBuilder.EntitySet<Subject>("Subject");
builder.Services.AddControllers()
    .AddOData(options => options
        .AddRouteComponents("odata", modelBuilder.GetEdmModel())
        .Select()
        .Filter()
        .OrderBy()
        .Expand()
        .Count()
        .SetMaxTop(null)
        .OrderBy())
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var firstErrorMessage = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault() ?? "Invalid request";

            var resp = ApiResponse<object>.Fail(firstErrorMessage);
            return new BadRequestObjectResult(resp);
        };
    });


builder.Services.AddMassTransit(cfg =>
{
    cfg.SetKebabCaseEndpointNameFormatter();
    cfg.AddConsumer<GetDocumentSummaryConsumer>();
    cfg.AddConsumer<CatalogTitlesRequestConsumer>();
    cfg.AddConsumer<CatalogCountersRequestConsumer>();
    cfg.AddConsumer<DocumentDownloadedConsumer>();

    cfg.AddRequestClient<UserFullNamesRequest>();

    cfg.UsingRabbitMq((context, bus) =>
    {
        var mq = builder.Configuration.GetSection("RabbitMQ");
        
        var connectionString = builder.Configuration.GetConnectionString("rabbitmq");
        if (!string.IsNullOrEmpty(connectionString))
        {
            var uri = new Uri(connectionString);
            bus.Host(uri.Host, uri.Port > 0 ? (ushort)uri.Port : (ushort)5672, uri.AbsolutePath.Length > 1 ? uri.AbsolutePath.TrimStart('/') : "/", h =>
            {
                if (!string.IsNullOrEmpty(mq["Username"]))
                    h.Username(mq["Username"]);
                if (!string.IsNullOrEmpty(mq["Password"]))
                    h.Password(mq["Password"]);
            });
        }
        else
        {
            bus.Host(builder.Configuration["RabbitMQ:Host"], "/", h =>
            {
                h.Username(builder.Configuration["RabbitMQ:Username"]);
                h.Password(builder.Configuration["RabbitMQ:Password"]);
            });
        }

        bus.ReceiveEndpoint("catalog.get-document-summary", e =>
        {
            e.ConfigureConsumer<GetDocumentSummaryConsumer>(context);
        });
        bus.ReceiveEndpoint("catalog.titles.request", e =>
        {
            e.ConfigureConsumer<CatalogTitlesRequestConsumer>(context);
        });

        bus.ReceiveEndpoint("catalog.counters.request", e =>
        {
            e.ConfigureConsumer<CatalogCountersRequestConsumer>(context);
        });
        bus.ReceiveEndpoint("activity.downloads", e =>
        {
            e.ConfigureConsumer<DocumentDownloadedConsumer>(context);

            e.PrefetchCount = 16;
            e.ConcurrentMessageLimit = 8;
            e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));

        });
    });
});

builder.Services.Configure<MassTransitHostOptions>(opts =>
{
    opts.WaitUntilStarted = true;
    opts.StartTimeout = TimeSpan.FromSeconds(30);
    opts.StopTimeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddJwtAuth(builder.Configuration);


builder.Services.AddHttpClient("AuthService", c =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        c.BaseAddress = new Uri(baseUrl);
});


builder.Services.AddScoped<IUserSessionValidator, HttpUserSessionValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Auto-apply EF Core migrations on startup (first run/clone friendly)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<CatalogDb>();
        db.Database.Migrate();
    }
    catch
    {
        // Ignore migration errors at startup to avoid blocking the app when DB is unreachable
    }
}

app.Run();
