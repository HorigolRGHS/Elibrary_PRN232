using Elib.Auth.Service.DTOs.Admin;
using Elib.Auth.Service.Models;
using Elib.Auth.Service.Profiles;
using Elib.Auth.Service.Repositories;
using Elib.Auth.Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using MassTransit;
using Elib.Auth.Service.Consumers;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();


builder.Services.AddDbContext<IdentityDb>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});


builder.Services.AddJwtAuth(builder.Configuration);


builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserSessionValidator, LocalUserSessionValidator>();

// Email
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();


builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(UserProfile).Assembly);
});

// OData
builder.Services.AddControllers()
    .AddOData(opt =>
    {
        opt.Select().Filter().OrderBy().Count().SetMaxTop(100).Expand()
            .AddRouteComponents("api", GetEdmModel());
    });


// ModelState -> ApiResponse
builder.Services.Configure<ApiBehaviorOptions>(options =>
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

//Rabbimq

builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();


    x.AddConsumer<UserCountersRequestConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var mq = builder.Configuration.GetSection("RabbitMQ");
        cfg.Host(mq["Host"], mq["VirtualHost"] ?? "/", h =>
        {
            h.Username(mq["Username"]);
            h.Password(mq["Password"]);
        });


        if (ushort.TryParse(mq["Prefetch"], out var prefetch) && prefetch > 0)
            cfg.PrefetchCount = prefetch;


        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Global exception
app.UseGlobalException();

// AuthN/Z
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


IEdmModel GetEdmModel()
{
    var odataBuilder = new ODataConventionModelBuilder();
    odataBuilder.EntitySet<UserListItemDTO>("Users"); 
    return odataBuilder.GetEdmModel();
}