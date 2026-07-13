import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Zap, MapPin, Navigation } from "lucide-react";
import api from "../api/axios";
import "../utils/leafletIcon";
import { greenIcon, redIcon } from "../utils/leafletIcon";
import SuggestionWidget from "../components/SuggestionWidget";
import AppLayout from "../components/AppLayout";

const NAVY = "#1B2A56";

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locError, setLocError] = useState("");
  const [sortByDistance, setSortByDistance] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (cityFilter) params.city = cityFilter;
      if (typeFilter) params.chargerType = typeFilter;
      const res = await api.get("/stations", { params });
      setStations(res.data);
    } catch (err) {
      setError("Could not load stations. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await api.get("/stations/availability");
      const map = {};
      res.data.forEach((a) => {
        map[a.stationId] = a;
      });
      setAvailability(map);
    } catch (err) {
      // non-critical, silently ignore
    }
  };

  useEffect(() => {
    fetchStations();
    fetchAvailability();
  }, [cityFilter, typeFilter]);

  const handleUseMyLocation = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
      },
      () => {
        setLocError("Could not get your location. Please allow location access.");
      }
    );
  };

  let displayStations = stations.map((s) => ({
    ...s,
    distanceKm: userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng) : null,
    isFullyBooked: availability[s._id]?.isFullyBooked || false,
  }));

  if (sortByDistance && userLocation) {
    displayStations = [...displayStations].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [26.8467, 81.0091];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-xl font-medium mb-1">Find a charging station</h1>
        <p className="text-sm text-gray-500 mb-6">
          Tell us your trip details and we'll suggest the best station for you.
        </p>

        <SuggestionWidget />

        <div className="flex flex-wrap items-center gap-3 mb-6 mt-6">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white cursor-pointer"
          >
            <option value="">All cities</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Kanpur">Kanpur</option>
            <option value="Noida">Noida</option>
            <option value="Agra">Agra</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white cursor-pointer"
          >
            <option value="">All charger types</option>
            <option value="fast">Fast</option>
            <option value="slow">Slow</option>
          </select>

          <button
            onClick={handleUseMyLocation}
            className="h-9 px-3 flex items-center gap-1 text-sm rounded-md border border-gray-300 bg-white cursor-pointer"
          >
            <Navigation size={14} /> Use my location
          </button>

          {userLocation && (
            <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={sortByDistance}
                onChange={(e) => setSortByDistance(e.target.checked)}
                className="cursor-pointer"
              />
              Sort by nearest
            </label>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 ml-auto">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Fully booked
            </span>
          </div>
        </div>

        {locError && <p className="text-sm text-red-600 mb-4">{locError}</p>}

        <div
          className="mb-6 rounded-lg overflow-hidden border border-gray-200 relative z-0"
          style={{ height: "420px" }}
        >
          <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {displayStations.map((station) => (
              <Marker
                key={station._id}
                position={[station.lat, station.lng]}
                icon={station.isFullyBooked ? redIcon : greenIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium mb-1">{station.name}</p>
                    <p className="text-xs text-gray-600 mb-1">{station.address}</p>
                    <p className={`text-xs font-medium mb-2 ${station.isFullyBooked ? "text-red-600" : "text-green-600"}`}>
                      {station.isFullyBooked ? "Fully booked today" : "Slots available today"}
                    </p>
                    <Link to={`/stations/${station._id}`} className="text-xs underline cursor-pointer" style={{ color: NAVY }}>
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <h2 className="text-base font-medium mb-3">Nearby Charging Stations</h2>

        {loading && <p className="text-sm text-gray-500">Loading stations...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && stations.length === 0 && (
          <p className="text-sm text-gray-500">No stations match these filters.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayStations.map((station) => (
            <div
              key={station._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">{station.name}</p>
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md shrink-0"
                  style={{
                    backgroundColor: station.chargerType === "fast" ? "#E6F1FB" : "#EAF3DE",
                    color: station.chargerType === "fast" ? "#0C447C" : "#27500A",
                  }}
                >
                  <Zap size={11} /> {station.chargerType}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <MapPin size={12} /> {station.address}
              </p>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">{station.totalSlots} slots per day</p>
                {station.distanceKm !== null && (
                  <p className="text-xs font-medium" style={{ color: NAVY }}>
                    {station.distanceKm.toFixed(1)} km away
                  </p>
                )}
              </div>
              {station.isFullyBooked && (
                <p className="text-xs text-red-600 font-medium mb-3">Fully booked today</p>
              )}
              <Link
                to={`/stations/${station._id}`}
                className="w-full h-9 flex items-center justify-center text-sm rounded-md text-white cursor-pointer"
                style={{ backgroundColor: NAVY }}
              >
                View Slots
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}