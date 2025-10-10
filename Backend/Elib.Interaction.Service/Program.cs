using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using Elib.Interaction.Service.Services;
using Elib.Interaction.Service.Profiles;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();


builder.Services.AddControllers()
    .AddOData(options => options
        .Select()
        .Filter()
        .OrderBy()
        .Expand()
        .Count()
        .SetMaxTop(100)
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

builder.Services.AddMassTransit(cfg =>
{
    cfg.SetKebabCaseEndpointNameFormatter();

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


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<InteractionDb>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});


builder.Services.AddScoped<DbContext, InteractionDb>();
builder.Services.AddHttpContextAccessor();


builder.Services.AddJwtAuth(builder.Configuration);


builder.Services.AddHttpClient("AuthService", c =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        c.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddScoped<IUserSessionValidator, HttpUserSessionValidator>();


builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IReportService, ReportService>();

// Activity (Notification) 
//builder.Services.AddScoped<INotificationRepository, NotificationRepository>();


// =============================================
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(ReportProfile).Assembly);
});

// =============================================

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
