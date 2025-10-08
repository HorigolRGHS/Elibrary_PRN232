using Elib.Activity.Service.Messaging.Clients;
using Elib.Activity.Service.Messaging.Comsumer;
using Elib.Activity.Service.Models;
using Elib.Activity.Service.Profiles;
using Elib.Activity.Service.Repositories;
using Elib.Activity.Service.Services;
using Microsoft.AspNetCore.Mvc;
using MassTransit;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Audits;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using Microsoft.OData.ModelBuilder;
using SharedLibrary.Messages;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers()
    .AddOData(options => options
        .Select()
        .Filter()
        .OrderBy()
        .Expand()
        .Count()
        .SetMaxTop(100)

    // .AddRouteComponents("odata", modelBuilder.GetEdmModel())
    )
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
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton(new AuditLogger(builder.Configuration.GetConnectionString("DefaultConnection")!));

builder.Services.AddDbContext<ActivityDb>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

///////////////////////////

builder.Services.AddScoped<DbContext, ActivityDb>();
builder.Services.AddHttpContextAccessor();
//////////////////////////

builder.Services.AddJwtAuth(builder.Configuration);

// HttpClient to Auth.Service for user validation
builder.Services.AddHttpClient("AuthService", c =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        c.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddScoped<IUserSessionValidator, HttpUserSessionValidator>();
builder.Services.AddScoped<IDownloadHistoryRepository, DownloadHistoryRepository>();
builder.Services.AddScoped<IDownloadHistoryService, DownloadHistoryService>();
builder.Services.AddScoped<ICatalogClient, CatalogClient>();

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(DownloadHistoryProfile).Assembly);
});


builder.Services.AddMassTransit(cfg =>
{
    cfg.SetKebabCaseEndpointNameFormatter();

    cfg.UsingRabbitMq((context, bus) =>
    {
        bus.Host(builder.Configuration["RabbitMQ:Host"], "/", h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"]);
            h.Password(builder.Configuration["RabbitMQ:Password"]);
        });

        bus.ReceiveEndpoint("activity.downloads", e =>
        {
            e.ConfigureConsumer<DocumentDownloadedConsumer>(context);

            e.PrefetchCount = 16;
            e.ConcurrentMessageLimit = 8;

            e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));
        });
    });

    cfg.AddRequestClient<GetDocumentSummary>(new Uri("queue:catalog.get-document-summary"));
});
builder.Services.AddScoped<ICatalogClient, CatalogClient>();

builder.Services.AddJwtAuthSwagger();

////////////////////////

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(NotificationProfile).Assembly);
});

////////////////////////

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

app.Run();
