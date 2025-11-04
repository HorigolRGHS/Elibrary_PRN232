using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Profiles;
using Elib.Interaction.Service.Repositories;
using Elib.Interaction.Service.Services;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.ModelBuilder;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using SharedLibrary.Messages;

var builder = WebApplication.CreateBuilder(args);


// Database 
builder.Services.AddDbContext<InteractionDb>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

builder.Services.AddScoped<DbContext, InteractionDb>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers().AddJsonOptions(options
=> options.JsonSerializerOptions.PropertyNamingPolicy = null);

// JWT / Auth
builder.Services.AddJwtAuth(builder.Configuration);

builder.Services.AddHttpClient("AuthService", c =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        c.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddScoped<IUserSessionValidator, HttpUserSessionValidator>();


//  RabbitMQ
builder.Services.AddMassTransit(cfg =>
{
    cfg.SetKebabCaseEndpointNameFormatter();
    cfg.AddRequestClient<CatalogTitlesRequest>();
    cfg.AddRequestClient<CatalogCountersRequest>();
    cfg.AddRequestClient<UserCountersRequest>();
    cfg.AddRequestClient<TopDownloadsRequest>(new Uri("queue:activity.top-downloads"));

    cfg.UsingRabbitMq((context, bus) =>
    {
        var mq = builder.Configuration.GetSection("RabbitMQ");
        bus.Host(mq["Host"], mq["VirtualHost"], h =>
        {
            h.Username(mq["Username"]);
            h.Password(mq["Password"]);
        });

        bus.PrefetchCount = ushort.TryParse(mq["Prefetch"], out var prefetch) ? prefetch : (ushort)16;
    });
});


// AutoMapper Profiles
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(ReportProfile).Assembly);
    cfg.AddMaps(typeof(RatingProfile).Assembly);
    cfg.AddMaps(typeof(CommentProfile).Assembly);
});

// Repositories & Services

builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();

builder.Services.AddScoped<IStatisticRepository, StatisticRepository>();
builder.Services.AddScoped<IStatisticService, StatisticService>();

builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ICommentService, CommentService>();

// OData Configuration
var modelBuilder = new ODataConventionModelBuilder();
modelBuilder.EntitySet<Comment>("Comment");
modelBuilder.EntitySet<Report>("Report");
modelBuilder.EntitySet<RatingReadDTO>("Ratings");

builder.Services.AddControllers()
    .AddOData(options => options
        .Select()
        .Filter()
        .OrderBy()
        .Expand()
        .Count()
        .SetMaxTop(100)
        .AddRouteComponents("odata", modelBuilder.GetEdmModel()))
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


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddJwtAuthSwagger();

builder.AddServiceDefaults();

var app = builder.Build();

app.MapDefaultEndpoints();

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
