using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Profiles;
using Elib.Interaction.Service.Repositories;
using Elib.Interaction.Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OData.ModelBuilder;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using System.Xml.Linq;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<Elib.Interaction.Service.Data.InteractionDb>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ElibInteractionServiceContext") ?? throw new InvalidOperationException("Connection string 'ElibInteractionServiceContext' not found.")));

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddDbContext<Elib.Interaction.Service.Data.InteractionDb>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// JWT/AuthN
builder.Services.AddJwtAuth(builder.Configuration);

// HttpClient to Auth.Service for user validation
builder.Services.AddHttpClient("AuthService", c =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        c.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(RatingProfile).Assembly);
});

builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();

var modelBuilder = new ODataConventionModelBuilder();
modelBuilder.EntitySet<Comment>("Comment");
modelBuilder.EntitySet<Report>("Report");
modelBuilder.EntitySet<Rating>("Rating");
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
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IUserSessionValidator, HttpUserSessionValidator>();

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
