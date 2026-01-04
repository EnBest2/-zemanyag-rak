using FuelApi;
using FuelApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/", () => new { status = "Fuel API running" });

app.MapGet("/stations", async () =>
{
    var stations = await FuelScraper.GetStationsAsync();
    return Results.Json(stations);
});

app.Run();
