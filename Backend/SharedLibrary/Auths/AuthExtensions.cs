using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Commons;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace SharedLibrary.Auths
{
    public static class AuthExtensions
    {
        public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration config)
        {
            var settings = config.GetSection("JwtSettings").Get<JwtSettings>() ?? throw new Exception("JwtSettings missing");
            services.AddSingleton(settings);
            services.AddSingleton(new JwtHelper(settings));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = settings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = settings.Audience,
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey)),
                    ValidateIssuerSigningKey = true
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        var email = principal?.FindFirst(ClaimTypes.Email)?.Value;
                        if (string.IsNullOrWhiteSpace(email))
                        {
                            context.Fail("Email claim missing");
                            return;
                        }

                        var validator = context.HttpContext.RequestServices.GetService<IUserSessionValidator>();
                        if (validator is null) return;

                        var ok = await validator.UserExistsAsync(email, context.HttpContext.RequestAborted);
                        if (!ok) context.Fail("User not found or inactive");
                    },
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        if (!context.Response.HasStarted)
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";
                            var json = JsonSerializer.Serialize(ApiResponse<string>.Fail("Unauthorized"));
                            await context.Response.WriteAsync(json);
                        }
                    },
                    OnForbidden = async context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        var json = JsonSerializer.Serialize(ApiResponse<string>.Fail("Forbidden"));
                        await context.Response.WriteAsync(json);
                    },
                    OnAuthenticationFailed = async context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        var json = JsonSerializer.Serialize(ApiResponse<string>.Fail("Authentication failed"));
                        await context.Response.WriteAsync(json);
                    }
                };
            });

            return services;
        }
    }
}