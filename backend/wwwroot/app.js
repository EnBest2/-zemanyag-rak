// A backend API URL-je
const API_URL = "https://zemanyag-rak.onrender.com/stations";

const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const stationsEl = document.getElementById("stations");
const fuelTypeSelect = document.getElementById("fuelType");

// Kútlista megjelenítése
function renderStations(sortedStations) {
  stationsEl.innerHTML = "";
  if (sortedStations.length === 0) {
    stationsEl.innerHTML = "<div class='station'>Nincs találat.</div>";
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
    badge.textContent = index === 0 ? "Legolcsóbb" : "Alternatíva";

    header.appendChild(name);
    header.appendChild(badge);

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${s.price} Ft/l`;

    const address = document.createElement("div");
    address.className = "distance";
    address.textContent = s.address;

    div.appendChild(header);
    div.appendChild(price);
    div.appendChild(address);

    stationsEl.appendChild(div);
  });
}

async function searchCheapest() {
  errorEl.textContent = "";
  stationsEl.innerHTML = "";
  statusEl.textContent = "Kútlista betöltése…";
  searchBtn.disabled = true;

  const fuelType = fuelTypeSelect.value;

  try {
    // Backend API hívása
    const stations = await fetch(API_URL).then(r => r.json());

    // Csak ár alapján rendezünk
    const withPrice = stations
      .map((s) => {
        const price = s.prices[fuelType];
        return { ...s, price };
      })
      .filter((s) => s.price != null);

    withPrice.sort((a, b) => a.price - b.price);

    statusEl.textContent = `Találatok: ${withPrice.length}. A legolcsóbb van felül.`;

    renderStations(withPrice);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Hiba történt a kútlista betöltésekor: " + err.message;
    statusEl.textContent = "Hiba történt.";
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", searchCheapest);
