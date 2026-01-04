// A backend API URL-je (jelenleg a Codespaces URL)
const API_URL = "https://sturdy-dollop-7vwp7xxqvwwx2xrp4-5202.app.github.dev/stations";

const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const stationsEl = document.getElementById("stations");
const fuelTypeSelect = document.getElementById("fuelType");
const maxDistanceInput = document.getElementById("maxDistance");

// Haversine-távolság számítás (km)
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function renderStations(sortedStations) {
  stationsEl.innerHTML = "";
  if (sortedStations.length === 0) {
    stationsEl.innerHTML = "<div class='station'>Nincs találat a megadott távolságon belül.</div>";
    return;
  }

  sortedStations.forEach((s, index) => {
    const div = document.createElement("div");
    div.className = "station";

    const header = document.createElement("div");
    header.className = "station-header";

    const name = document.createElement("div");
    name.className = "station-name";
    name.textContent = `${s.name} (${s.brand})`;

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = index === 0 ? "Legolcsóbb a közelben" : "Alternatíva";

    header.appendChild(name);
    header.appendChild(badge);

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${s.price} Ft/l`;

    const distance = document.createElement("div");
    distance.className = "distance";
    distance.textContent = `${s.distance.toFixed(1)} km • ${s.address}`;

    div.appendChild(header);
    div.appendChild(price);
    div.appendChild(distance);

    stationsEl.appendChild(div);
  });
}

async function searchCheapest() {
  errorEl.textContent = "";
  stationsEl.innerHTML = "";
  statusEl.textContent = "Pozíció lekérése…";
  searchBtn.disabled = true;

  const fuelType = fuelTypeSelect.value;
  const maxDistance = Number(maxDistanceInput.value) || 30;

  if (!("geolocation" in navigator)) {
    errorEl.textContent = "A böngésző nem támogatja a helymeghatározást.";
    searchBtn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      statusEl.textContent = "Kútlista betöltése…";

      try {
        // Valódi backend API hívása
        const stations = await fetch(API_URL).then(r => r.json());

        // Távolság + ár kiválasztása
        const withDistanceAndPrice = stations
          .map((s) => {
            const distance = distanceKm(latitude, longitude, s.lat, s.lng);
            const price = s.prices[fuelType];
            return { ...s, distance, price };
          })
          .filter((s) => s.price != null && s.distance <= maxDistance);

        withDistanceAndPrice.sort((a, b) => {
          if (a.price === b.price) {
            return a.distance - b.distance;
          }
          return a.price - b.price;
        });

        if (withDistanceAndPrice.length === 0) {
          statusEl.textContent = "Nincs kút a megadott távolságon belül a választott üzemanyaggal.";
        } else {
          statusEl.textContent = `Találatok: ${withDistanceAndPrice.length}. A legolcsóbb van felül.`;
        }

        renderStations(withDistanceAndPrice);
      } catch (err) {
        console.error(err);
        errorEl.textContent = "Hiba történt a kútlista betöltésekor: " + err.message;
        statusEl.textContent = "Hiba történt.";
      } finally {
        searchBtn.disabled = false;
      }
    },
    (err) => {
      console.error(err);
      errorEl.textContent = "Nem sikerült lekérni a pozíciódat: " + err.message;
      statusEl.textContent = "Hiba történt.";
      searchBtn.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

searchBtn.addEventListener("click", searchCheapest);
