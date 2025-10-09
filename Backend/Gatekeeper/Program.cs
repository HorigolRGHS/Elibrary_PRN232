using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;
using SharedLibrary.Auths;
using SharedLibrary.Commons;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddHealthChecks();


builder.Configuration
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Configuration
      .SetBasePath(builder.Environment.ContentRootPath)
      .AddOcelot();
builder.Services
    .AddOcelot(builder.Configuration);

// Bind JwtSettings from configuration (appsettings.json or environment)
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var jwtSettings = jwtSection.Get<JwtSettings>();

// Custom middleware-based JWT validation at gateway
builder.Services.AddSingleton(jwtSettings ?? throw new Exception("Gateway JwtSettings missing"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        p => p.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});


var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapDefaultEndpoints();

app.UseHttpsRedirection();


app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;
    if (path.StartsWith("/auth", StringComparison.OrdinalIgnoreCase))
    {
        await next();
        return;
    }

    if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader) || string.IsNullOrWhiteSpace(authHeader))
    {
        await next();
        return;
    }

    var header = authHeader.ToString();
    if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(ApiResponse<string>.Fail("Invalid Authorization header"));
        return;
    }

    var token = header.Substring("Bearer ".Length).Trim();

    try
    {
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings!.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings!.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings!.SecretKey))
        };

        var principal = tokenHandler.ValidateToken(token, validationParams, out var _);
        context.User = principal; // forward principal to downstream
        await next();
    }
    catch
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(ApiResponse<string>.Fail("Invalid token"));
    }
});

app.MapGet("/", () => Results.Ok(new
{
    name = "ELibrary API Gateway",
    time = DateTimeOffset.UtcNow
}));
app.MapGet("/health", () => Results.Ok(new { status = "ok", target = "gateway", at = DateTimeOffset.UtcNow }));
app.MapHealthChecks("/healthz");

app.UseOcelot().Wait();

app.Run();app.Run();