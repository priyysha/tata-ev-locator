import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap, MapPin, CheckCircle2, Calculator } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import AppLayout from "../components/AppLayout";

const NAVY = "#1B2A56";

const BATTERY_CAPACITY_KWH = {
  "Nexon EV": 40.5,
  "Punch EV": 35,
  "Tiago EV": 24,
  "Curvv EV": 45,
};

const RATE_PER_KWH = { fast: 18, slow: 12 };

function getNext7Dates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function StationDetail() {
  const { id } = useParams();
  const dateOptions = getNext7Dates();
  const { user } = useAuth();

  const [station, setStation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [pendingSlot, setPendingSlot] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [batteryNeeded, setBatteryNeeded] = useState(50);

  const fetchStation = async () => {
    try {
      const res = await api.get(`/stations/${id}`);
      setStation(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Could not load station details." });
    }
  };

  const fetchSlots = async (date) => {
    setLoading(true);
    try {
      const res = await api.get("/slots", { params: { stationId: id, date } });
      setSlots(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Could not load slots." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStation();
  }, [id]);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [id, selectedDate]);

  const handleSlotClick = (slot) => {
    if (slot.isBooked) return;
    setPendingSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!pendingSlot) return;
    setConfirming(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/bookings", { stationId: id, slotId: pendingSlot._id });
      setMessage({ type: "success", text: "Slot booked successfully!" });
      setPendingSlot(null);
      fetchSlots(selectedDate);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Booking failed." });
      setPendingSlot(null);
    } finally {
      setConfirming(false);
    }
  };

  if (!station) {
    return (
      <AppLayout>
        <div className="p-10 text-center text-sm text-gray-500">Loading station...</div>
      </AppLayout>
    );
  }

  const batteryCapacity = BATTERY_CAPACITY_KWH[user?.evModel] || 40;
  const kwhNeeded = (batteryCapacity * batteryNeeded) / 100;
  const estimatedCost = Math.round(kwhNeeded * RATE_PER_KWH[station.chargerType]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/stations" className="flex items-center gap-1 text-sm text-gray-500 w-fit mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to stations
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-lg font-medium">{station.name}</h1>
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: station.chargerType === "fast" ? "#E6F1FB" : "#EAF3DE",
                color: station.chargerType === "fast" ? "#0C447C" : "#27500A",
              }}
            >
              <Zap size={11} /> {station.chargerType}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={13} /> {station.address}
          </p>
          <p className="text-xs text-gray-400 mt-1">{station.totalSlots} slots per day</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} style={{ color: NAVY }} />
            <p className="text-sm font-medium">Estimate charging cost</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Based on your {user?.evModel || "EV"} ({batteryCapacity} kWh battery) at this station's {station.chargerType} charger rate.
          </p>
          <label className="text-[13px] text-gray-500 block mb-1.5">
            Battery % you need charged
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={batteryNeeded}
            onChange={(e) => setBatteryNeeded(Number(e.target.value))}
            className="w-full mb-2 cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{batteryNeeded}%</span>
            <span className="font-medium" style={{ color: NAVY }}>
              ≈ {kwhNeeded.toFixed(1)} kWh · ₹{estimatedCost}
            </span>
          </div>
        </div>

        <p className="text-sm font-medium mb-2">Select a date</p>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {dateOptions.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="px-3 h-9 rounded-md text-sm whitespace-nowrap border cursor-pointer"
              style={{
                backgroundColor: selectedDate === date ? NAVY : "white",
                color: selectedDate === date ? "white" : "#374151",
                borderColor: selectedDate === date ? NAVY : "#D1D5DB",
              }}
            >
              {date}
            </button>
          ))}
        </div>

        {message.text && (
          <div
            className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 mb-4 ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" && <CheckCircle2 size={14} />}
            {message.text}
          </div>
        )}

        <p className="text-sm font-medium mb-2">Available slots</p>
        {loading ? (
          <p className="text-sm text-gray-500">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500">No slots found for this date.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {slots.map((slot) => (
              <button
                key={slot._id}
                disabled={slot.isBooked}
                onClick={() => handleSlotClick(slot)}
                className="h-12 rounded-md text-sm border disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: slot.isBooked ? "#F3F4F6" : "#EAF3DE",
                  color: slot.isBooked ? "#9CA3AF" : "#27500A",
                  borderColor: slot.isBooked ? "#E5E7EB" : "#C8E0AE",
                }}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingSlot}
        title="Confirm booking"
        message={pendingSlot ? `Book the ${pendingSlot.startTime} - ${pendingSlot.endTime} slot at ${station.name}?` : ""}
        confirmLabel="Book slot"
        loading={confirming}
        onConfirm={handleConfirmBooking}
        onCancel={() => setPendingSlot(null)}
      />
    </AppLayout>
  );
}