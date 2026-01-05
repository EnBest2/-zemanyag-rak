using FuelApi;
using FuelApi.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS engedélyezése
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Statikus fájlok kiszolgálása (index.html, app.js, sw.js, ikonok)
app.UseDefaultFiles();
app.UseStaticFiles();

// API endpointok
app.MapGet("/stations", async () =>
{
    var stations = await FuelScraper.GetStationsAsync();
    return Results.Json(stations);
});

// Health check
app.MapGet("/api-status", () => new { status = "Fuel API running" });

// PWA fallback – minden más útvonal az index.html-t adja vissza
app.MapFallbackToFile("index.html");

app.Run();
