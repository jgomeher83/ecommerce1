<script setup>
import { ref, onMounted, computed } from "vue";

const API_BASE_URL = "https://api.apuntatealpaseo.com.co";

const flightsRaw = ref([]);
const flights = ref([]);        // normalized for UI
const loading = ref(false);
const error = ref("");

// Fallback names if API doesn't include operating.carrierName
const CARRIER_FALLBACK = {
  AV: "Avianca",
  LA: "LATAM Airlines Colombia",
  VE: "EasyFly",
  "9R": "SATENA",
  P5: "Wingo",
};

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "2-digit" });
}
function fmtDuration(isoDur) {
  // very small ISO-8601 duration pretty printer, e.g. PT1H35M -> 1h 35m
  const h = /(\d+)H/.exec(isoDur)?.[1];
  const m = /(\d+)M/.exec(isoDur)?.[1];
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(" ") || isoDur;
}

async function fetchFlights() {
  loading.value = true;
  error.value = "";

  const params = new URLSearchParams({
    origin: "BOG",
    dest: "MDE",          // Try "EOH" as well for Medellín city (see note below)
    date: "2025-09-15",
    adults: "1",
  }).toString();

  try {
    const res = await fetch(`${API_BASE_URL}/api/flights?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();     // your backend returns the raw Amadeus offers (array)
    flightsRaw.value = Array.isArray(data) ? data : [];

    // Normalize for display (first itinerary only for one-way)
    flights.value = flightsRaw.value.map((offer) => {
      const it = offer.itineraries?.[0];
      const seg = it?.segments?.[0];
      const lastSeg = it?.segments?.[it.segments.length - 1];

      const carrierCode = seg?.operating?.carrierCode || seg?.carrierCode;
      const carrierName =
        seg?.operating?.carrierName ||
        CARRIER_FALLBACK[carrierCode] ||
        carrierCode;

      return {
        id: offer.id,
        price: {
          total: offer.price?.grandTotal || offer.price?.total,
          currency: offer.price?.currency,
        },
        carrier: { code: carrierCode, name: carrierName },
        flightNumber: `${carrierCode}${seg?.number ?? ""}`,
        aircraft: seg?.aircraft?.code,
        from: seg?.departure?.iataCode,
        to: lastSeg?.arrival?.iataCode,
        depTime: fmtTime(seg?.departure?.at),
        arrTime: fmtTime(lastSeg?.arrival?.at),
        depDate: fmtDate(seg?.departure?.at),
        arrDate: fmtDate(lastSeg?.arrival?.at),
        duration: fmtDuration(it?.duration),
        stops: (it?.segments?.length || 1) - 1,
        cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin,
        bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class,
        brandedFare: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFareLabel
          || offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare,
        seatsLeft: offer.numberOfBookableSeats,
        includedBags:
          offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? 0,
        validating: offer.validatingAirlineCodes?.[0],
      };
    }).sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
  } catch (err) {
    error.value = err.message || "Error fetching flights";
    flights.value = [];
  } finally {
    loading.value = false;
  }
}

const uniqueCarriers = computed(() => {
  const set = new Set(flights.value.map(f => f.carrier.code));
  return Array.from(set);
});
async function fetchBogotaMedellinAll() {
  loading.value = true; error.value = ""; flights.value = [];
  const searches = [
    { origin: "BOG", dest: "MDE" },
    { origin: "BOG", dest: "EOH" },
  ];
  const date = "2025-09-15";

  const results = [];
  for (const s of searches) {
    const qs = new URLSearchParams({ origin: s.origin, dest: s.dest, date, adults: "1" }).toString();
    const res = await fetch(`${API_BASE_URL}/api/flights?${qs}`);
    if (res.ok) results.push(...await res.json());
    await new Promise(r => setTimeout(r, 150)); // be gentle with rate limits in test env
  }
  flightsRaw.value = results;
  flights.value = flightsRaw.value.map((offer) => {
      const it = offer.itineraries?.[0];
      const seg = it?.segments?.[0];
      const lastSeg = it?.segments?.[it.segments.length - 1];

      const carrierCode = seg?.operating?.carrierCode || seg?.carrierCode;
      const carrierName =
        seg?.operating?.carrierName ||
        CARRIER_FALLBACK[carrierCode] ||
        carrierCode;

      return {
        id: offer.id,
        price: {
          total: offer.price?.grandTotal || offer.price?.total,
          currency: offer.price?.currency,
        },
        carrier: { code: carrierCode, name: carrierName },
        flightNumber: `${carrierCode}${seg?.number ?? ""}`,
        aircraft: seg?.aircraft?.code,
        from: seg?.departure?.iataCode,
        to: lastSeg?.arrival?.iataCode,
        depTime: fmtTime(seg?.departure?.at),
        arrTime: fmtTime(lastSeg?.arrival?.at),
        depDate: fmtDate(seg?.departure?.at),
        arrDate: fmtDate(lastSeg?.arrival?.at),
        duration: fmtDuration(it?.duration),
        stops: (it?.segments?.length || 1) - 1,
        cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin,
        bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class,
        brandedFare: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFareLabel
          || offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare,
        seatsLeft: offer.numberOfBookableSeats,
        includedBags:
          offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? 0,
        validating: offer.validatingAirlineCodes?.[0],
      };
    }).sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
}

onMounted(fetchBogotaMedellinAll);
</script>

<template>
  <div class="flights-page" style="max-width:900px;margin:auto;padding:16px;">
    <h1>Available Flights</h1>

    <button @click="fetchFlights" :disabled="loading" class="btn">
      {{ loading ? "Loading..." : "Reload Flights" }}
    </button>

    <p v-if="error" style="color:#c00;margin-top:8px;">{{ error }}</p>

    <div v-if="flights.length" style="margin-top:16px;">
      <div style="margin-bottom:8px;font-size:14px;color:#555;">
        Found {{ flights.length }} offers · Carriers: {{ uniqueCarriers.join(", ") }}
      </div>

      <div v-for="f in flights" :key="f.id"
           style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;">
              {{ f.carrier.name }} ({{ f.flightNumber }})
            </div>
            <div style="font-size:12px;color:#666;">
              {{ f.depDate }} {{ f.depTime }} — {{ f.arrDate }} {{ f.arrTime }}
            </div>
          </div>
          <div style="font-size:18px;font-weight:700;">
            {{ f.price.total }} {{ f.price.currency }}
          </div>
        </div>

        <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;">
          <div><strong>{{ f.from }}</strong> → <strong>{{ f.to }}</strong></div>
          <div>Duration: {{ f.duration }}</div>
          <div>Stops: {{ f.stops }}</div>
          <div>Cabin: {{ f.cabin }} ({{ f.bookingClass }})</div>
          <div>Bags: {{ f.includedBags }}</div>
          <div>Seats left: {{ f.seatsLeft }}</div>
          <div v-if="f.brandedFare">Fare: {{ f.brandedFare }}</div>
          <div v-if="f.aircraft">Aircraft: {{ f.aircraft }}</div>
          <div v-if="f.validating">Validating: {{ f.validating }}</div>
        </div>
      </div>
    </div>

    <p v-else-if="!loading" style="margin-top:12px;color:#555;">
      No flights found. Try adjusting your search criteria.
    </p>
  </div>
</template>



<style scoped>
.flights-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin: 1rem 0;
}

.flights-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.flight-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.flight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.flight-header h3 {
  margin: 0;
  color: #333;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2196F3;
}

.flight-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route {
  font-size: 1.1rem;
}

.airport {
  font-weight: bold;
  color: #333;
}

.arrow {
  margin: 0 0.5rem;
  color: #666;
}

.time {
  color: #666;
  font-size: 0.9rem;
}

.no-flights {
  text-align: center;
  color: #666;
  margin-top: 2rem;
}
</style>
