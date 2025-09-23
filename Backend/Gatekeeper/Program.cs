using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddHealthChecks();


builder.Configuration
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

//builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
//    .AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Configuration
      .SetBasePath(builder.Environment.ContentRootPath)
      .AddOcelot();
builder.Services
    .AddOcelot(builder.Configuration);


//var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-secret-change-me";
//var issuer = builder.Configuration["Jwt:Issuer"] ?? "your-issuer";
//var audience = builder.Configuration["Jwt:Audience"] ?? "your-audience";

//builder.Services
//    .AddAuthentication(options =>
//    {
//        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//    })
//    .AddJwtBearer(options =>
//    {
//        options.RequireHttpsMetadata = false;
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
//            ValidateIssuer = true,
//            ValidIssuer = issuer,
//            ValidateAudience = true,
//            ValidAudience = audience,
//            ValidateLifetime = true,
//            ClockSkew = TimeSpan.FromSeconds(30)
//        };
//    });


var app = builder.Build();

app.MapDefaultEndpoints();

//app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/", () => Results.Ok(new
{
    name = "ELibrary API Gateway",
    time = DateTimeOffset.UtcNow
}));
app.MapGet("/health", () => Results.Ok(new { status = "ok", target = "gateway", at = DateTimeOffset.UtcNow }));
app.MapHealthChecks("/healthz");

app.UseAuthentication();
app.UseAuthorization();

app.UseOcelot().Wait();

app.Run();