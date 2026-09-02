using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
DbSession.ConnectionStrings = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddControllers();
var jwtSetting = JwtSettings.FromConfiguration(builder.Configuration);
builder.Services.AddSingleton(jwtSetting);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = "JWT_OR_COOKIE";
        options.DefaultChallengeScheme = "JWT_OR_COOKIE";
    })
    .AddPolicyScheme("JWT_OR_COOKIE", "JWT_OR_COOKIE", options =>
    {
        options.ForwardDefaultSelector = context =>
        {
            if (context.Request.Headers.ContainsKey("Authorization"))
                return JwtBearerDefaults.AuthenticationScheme;
            return CookieAuthenticationDefaults.AuthenticationScheme;
        };
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSetting.Issuer,
            ValidAudience = jwtSetting.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSetting.SecretKey)),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role

        };

    })
    .AddCookie(options =>
    {
        options.Cookie.Name = "TaracliagazCookie";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(jwtSetting.ExpireMinutes);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();

var frontendOrigin = builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
var productionOrigin = builder.Configuration["Frontend:ProductionUrl"] ?? "https://taraclia-gaz.md";
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy.WithOrigins(
            frontendOrigin,
            productionOrigin,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://localhost:5173",
            "https://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "https://localhost:5174",
            "https://127.0.0.1:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped(typeof(ICrudRepository<,>), typeof(EfCrudRepository<,>));
builder.Services.AddScoped(typeof(ICrudActions<,,>), typeof(CrudFlow<,,>));
builder.Services.AddScoped<PasswordHasher, PasswordHasher>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<IAuthActions, AuthFlow>();
builder.Services.AddScoped<IUserActions, UserFlow>();

var app = builder.Build();

var logger = app.Logger;
logger.LogInformation("Application started at {Time}", DateTime.UtcNow);
logger.LogInformation("Environment: {EnvironmentName}", app.Environment.EnvironmentName);
logger.LogInformation("Frontend Production URL: {FrontendProductionUrl}", productionOrigin);
logger.LogInformation("Backend started on {Urls}", string.Join(", ", app.Urls));
logger.LogInformation("CORS allowed origins: {Origins}", string.Join(", ", frontendOrigin, productionOrigin, "http://localhost:5173"));

using (var scope = app.Services.CreateScope())
{
    var db = sp.GetRequiredService<TaracliaGazDBContext>();
    var configuration = sp.GetRequiredService<IConfiguration>();
    var passwordhasher = sp.GetRequiredService<IPasswordHasher>();
    var seedlogger = sp.GetRequiredService<ILogger<SeedActions>>();
    var seedpath = Path.Combine(app.Environment.ContentRootPath, "SeedData");

    var seeder = new SeedActions(
        db,
        seedpath,
        configuration,
        passwordhasher,
        app.Environment.IsDevelopment(),
        seedlogger);

    try
    {
        await seeder.SeedAsync();
        logger.LogInformation("DB seed completed.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex,"DB seed failed");
        throw;
    }
}


app.UseRouting();
app.UseCors("FrontendCorsPolicy");

if(!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Ok(new { status = "TaracliaGaz API is online" }));
app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }));

app.Run();
