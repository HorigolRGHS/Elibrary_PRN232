using Elib.Activity.Service.Models;
using Elib.Activity.Service.Profiles;
using Elib.Activity.Service.Repositories;
using Elib.Activity.Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using Microsoft.OData.ModelBuilder;

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
