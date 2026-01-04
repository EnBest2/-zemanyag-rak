using FuelApi.Models;
using HtmlAgilityPack;

namespace FuelApi;

public static class FuelScraper
{
    // Itt tudod bővíteni a kutak listáját
    private static readonly List<(string Url, string Name, string Brand)> StationSources = new()
    {
        ("https://holtankoljak.hu/orlen_janoshalma_1107", "ORLEN Jánoshalma", "ORLEN"),
        ("https://holtankoljak.hu/orlen_baja_240", "ORLEN Baja", "ORLEN"),
        ("https://holtankoljak.hu/shell_baja_494", "Shell Baja 1", "Shell"),
        ("https://holtankoljak.hu/shell_baja_495", "Shell Baja 2", "Shell"),
        ("https://holtankoljak.hu/mol_baja_1055", "MOL Baja", "MOL"),
        ("https://holtankoljak.hu/mobil_petrol_benzinkutak_baja_1882", "Mobil Petrol Baja", "Mobil Petrol"),
        ("https://holtankoljak.hu/oil!_benzinkutak_baja_2112", "OIL! Baja", "OIL!")
    };

    public static async Task<List<FuelStation>> GetStationsAsync()
    {
        var results = new List<FuelStation>();
        var web = new HtmlWeb();

        foreach (var src in StationSources)
        {
            try
            {
                var doc = await web.LoadFromWebAsync(src.Url);

                var station = new FuelStation
                {
                    Name = src.Name,
                    Brand = src.Brand
                };

                // Cím kinyerése a fejlécből, pl.:
                // "ORLEN - Jánoshalma, Halasi út 91. (4099/3. hrsz)."
                var header = doc.DocumentNode.SelectSingleNode("//div[@class='subpage']");
                if (header != null)
                {
                    var text = header.InnerText.Trim();
                    var parts = text.Split('-', 2);
                    if (parts.Length == 2)
                        station.Address = parts[1].Trim();
                }

                // Koordináták kinyerése az utvonalterv.hu linkből
                var routeLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href,'utvonalterv.hu')]");
                if (routeLink != null)
                {
                    var href = routeLink.GetAttributeValue("href", "");
                    var coords = ExtractCoordinates(href);
                    if (coords != null)
                    {
                        station.Lat = coords.Value.lat;
                        station.Lng = coords.Value.lng;
                    }
                }

                // Üzemanyagárak kinyerése a d-flex mb-3 blokkokból
                var priceBlocks = doc.DocumentNode.SelectNodes("//div[@class='d-flex mb-3']");
                if (priceBlocks != null)
                {
                    foreach (var block in priceBlocks)
                    {
                        var img = block.SelectSingleNode(".//img");
                        var priceNode = block.SelectSingleNode(".//span[@class='ar']");

                        if (img == null || priceNode == null)
                            continue;

                        var imgSrc = img.GetAttributeValue("src", "").ToLower();
                        var priceText = priceNode.InnerText
                            .Replace("Ft/liter", "", StringComparison.OrdinalIgnoreCase)
                            .Trim();

                        if (!double.TryParse(
                                priceText,
                                System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture,
                                out double price))
                            continue;

                        // Ikon alapján azonosítjuk az üzemanyag típusát
                        if (imgSrc.Contains("gazolaj.png"))
                            station.Prices["diesel"] = price;

                        if (imgSrc.Contains("95-benzin-e10.png"))
                            station.Prices["95"] = price;

                        if (imgSrc.Contains("100-benzin-e10.png"))
                            station.Prices["100"] = price;

                        if (imgSrc.Contains("premium_gazolaj.png"))
                            station.Prices["premium_diesel"] = price;
                    }
                }

                results.Add(station);
            }
            catch
            {
                // Ha egy kút hibázik, a többi attól még működjön
            }
        }

        return results;
    }

    private static (double lat, double lng)? ExtractCoordinates(string url)
    {
        try
        {
            // Példa href:
            // https://utvonalterv.hu/?method=1&addresses=[[ , ],[19.343246459960938,46.298065185546875]]
            // A 3. [] blokkban van: [lng,lat]
            var part = url.Split('[', ']')[3]; // [lng,lat]
            var nums = part.Split(',');
            double lng = double.Parse(nums[0], System.Globalization.CultureInfo.InvariantCulture);
            double lat = double.Parse(nums[1], System.Globalization.CultureInfo.InvariantCulture);
            return (lat, lng);
        }
        catch
        {
            return null;
        }
    }
}
