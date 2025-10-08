using Elib.Storage.Service.Services;
using MassTransit;
using Microsoft.OpenApi.Models;
using SharedLibrary.Auths;
using SharedLibrary.Commons;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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
builder.Services.AddScoped<IUploadImageService, ImgBBService>();
builder.Services.AddScoped<IBlobService, AzureStorageService>();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Elib.Storage.Service",
        Version = "v1"
    });

    c.EnableAnnotations();

    c.CustomSchemaIds(t => t.FullName);

    c.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });

    c.SupportNonNullableReferenceTypes();
});


builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"] ?? "localhost", "/", h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMQ:Password"] ?? "guest");
        });

    });
});

var app = builder.Build();

app.UseGlobalException();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt =>
    {
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Elib.Storage.Service v1");
        opt.DisplayRequestDuration();
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
