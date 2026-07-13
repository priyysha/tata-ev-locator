import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, IndianRupee, TrendingUp, Calendar } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";

const NAVY = "#1B2A56";

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: "", evModel: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", evModel: user.evModel || "" });
    }
  }, [user]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/bookings/stats");
      setStats(res.data);
    } catch (err) {
      // silently ignore, stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.put("/users/me", form);
      login(res.data, localStorage.getItem("token"));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Could not update profile." });
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: "Charging sessions", value: stats?.totalSessions ?? 0, icon: Calendar },
    { label: "Total kWh charged", value: `${stats?.totalKwh ?? 0} kWh`, icon: Zap },
    { label: "Total spent", value: `₹${stats?.totalCost ?? 0}`, icon: IndianRupee },
    { label: "Estimated savings vs petrol", value: `₹${stats?.estimatedSavings ?? 0}`, icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/stations" className="flex items-center gap-1 text-sm text-gray-500 w-fit mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to stations
        </Link>

        <h1 className="text-xl font-medium mb-6">My Profile</h1>

        {/* Profile form */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="text-[13px] text-gray-500 block mb-1.5">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray-500 block mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full h-9 px-3 rounded-md border border-gray-200 text-sm bg-gray-50 text-gray-400"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray-500 block mb-1.5">Your EV model</label>
              <select
                name="evModel"
                value={form.evModel}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white cursor-pointer"
              >
                <option value="">Select model</option>
                <option value="Nexon EV">Nexon EV</option>
                <option value="Punch EV">Punch EV</option>
                <option value="Tiago EV">Tiago EV</option>
                <option value="Curvv EV">Curvv EV</option>
              </select>
            </div>

            {message.text && (
              <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-fit h-9 px-5 text-sm rounded-md text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: NAVY }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Charging stats */}
        <h2 className="text-base font-medium mb-3">Charging History & Stats</h2>
        {statsLoading ? (
          <p className="text-sm text-gray-500">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center mb-2">
                  <Icon size={16} style={{ color: NAVY }} />
                </div>
                <p className="text-lg font-medium">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}