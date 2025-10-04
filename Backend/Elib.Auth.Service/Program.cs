using Elib.Auth.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;
using Elib.Auth.Service.Repositories;
using Elib.Auth.Service.Services;
using SharedLibrary.Auths;

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

builder.Services.AddControllers();
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