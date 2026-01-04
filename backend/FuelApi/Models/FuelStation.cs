namespace FuelApi.Models;

public class FuelStation
{
    public string Name { get; set; } = "";
    public string Brand { get; set; } = "";
    public string Address { get; set; } = "";
    public double Lat { get; set; }
    public double Lng { get; set; }

    public Dictionary<string, double> Prices { get; set; } = new();
}
