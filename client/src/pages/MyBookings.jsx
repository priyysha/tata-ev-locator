import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, MoreVertical, X, Zap } from "lucide-react";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import AppLayout from "../components/AppLayout";

const NAVY = "#1B2A56";
const TABS = ["upcoming", "completed", "cancelled", "all"];

function ActionsMenu({ booking, onCancel, onComplete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 cursor-pointer"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onComplete(booking); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 hover:bg-gray-50 text-left cursor-pointer"
          >
            <Zap size={12} /> Mark as Charged
          </button>
          <button
            onClick={() => { setOpen(false); onCancel(booking); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-gray-50 text-left cursor-pointer"
          >
            <X size={12} /> Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [error, setError] = useState("");

  const [pendingAction, setPendingAction] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/me");
      setBookings(res.data);
    } catch (err) {
      setError("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setConfirming(true);
    try {
      if (pendingAction.type === "cancel") {
        await api.patch(`/bookings/${pendingAction.booking._id}/cancel`);
      } else if (pendingAction.type === "complete") {
        await api.patch(`/bookings/${pendingAction.booking._id}/complete`);
      }
      setPendingAction(null);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
      setPendingAction(null);
    } finally {
      setConfirming(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const statusColors = {
    upcoming: { bg: "#E6F1FB", text: "#0C447C" },
    completed: { bg: "#EAF3DE", text: "#27500A" },
    cancelled: { bg: "#FEE2E2", text: "#991B1B" },
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/stations" className="flex items-center gap-1 text-sm text-gray-500 w-fit mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to stations
        </Link>

        <h1 className="text-xl font-medium mb-4">My Bookings</h1>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 h-8 rounded-md text-sm capitalize border cursor-pointer"
              style={{
                backgroundColor: activeTab === tab ? NAVY : "white",
                color: activeTab === tab ? "white" : "#374151",
                borderColor: activeTab === tab ? NAVY : "#D1D5DB",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-sm text-gray-500">Loading bookings...</p>}

        {!loading && filteredBookings.length === 0 && (
          <p className="text-sm text-gray-500">No {activeTab !== "all" ? activeTab : ""} bookings found.</p>
        )}

        <div className="flex flex-col gap-3">
          {filteredBookings.map((booking) => {
            const colors = statusColors[booking.status] || { bg: "#F3F4F6", text: "#374151" };
            return (
              <div
                key={booking._id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm mb-1">{booking.stationId?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin size={12} /> {booking.stationId?.city}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.slotId?.date} · {booking.slotId?.startTime} - {booking.slotId?.endTime}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-md capitalize"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {booking.status}
                  </span>

                  {booking.status === "upcoming" && (
                    <ActionsMenu
                      booking={booking}
                      onCancel={(b) => setPendingAction({ booking: b, type: "cancel" })}
                      onComplete={(b) => setPendingAction({ booking: b, type: "complete" })}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        open={!!pendingAction}
        title={pendingAction?.type === "cancel" ? "Cancel booking" : "Confirm charging complete"}
        message={
          pendingAction?.type === "cancel"
            ? `Cancel your booking at ${pendingAction.booking.stationId?.name}? This slot will become available again.`
            : pendingAction
            ? `Confirm you've finished charging at ${pendingAction.booking.stationId?.name}? This will free up the slot for others.`
            : ""
        }
        confirmLabel={pendingAction?.type === "cancel" ? "Yes, cancel" : "Yes, mark as charged"}
        loading={confirming}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </AppLayout>
  );
}