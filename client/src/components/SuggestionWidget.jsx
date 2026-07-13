import { useState } from "react";
import { Sparkles } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const NAVY = "#1B2A56";
const CITIES = ["Lucknow", "Kanpur", "Noida", "Agra"];

export default function SuggestionWidget() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    evModel: user?.evModel || "",
    chargePercent: 30,
    source: "",
    destination: "",
  });
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.evModel || !form.source) {
      setError("Please select your EV model and source city.");
      return;
    }
    setLoading(true);
    setError("");
    setSuggestion("");
    try {
      const res = await api.post("/suggest", {
        evModel: form.evModel,
        chargePercent: Number(form.chargePercent),
        source: form.source,
        destination: form.destination || undefined,
      });
      setSuggestion(res.data.suggestion);
    } catch (err) {
      setError("Could not get a suggestion right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: NAVY }} />
        <p className="text-sm font-medium">Not sure where to charge?</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Tell us about your trip and we'll suggest the best station for you.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">
              Current charge: {form.chargePercent}%
            </label>
            <input
              type="range"
              name="chargePercent"
              min="5"
              max="100"
              step="5"
              value={form.chargePercent}
              onChange={handleChange}
              className="w-full mt-2 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Where are you now</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white cursor-pointer"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Heading to (optional)</label>
            <select
              name="destination"
              value={form.destination}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white cursor-pointer"
            >
              <option value="">None</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-fit h-9 px-4 text-sm rounded-md text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          style={{ backgroundColor: NAVY }}
        >
          {loading ? "Thinking..." : "Get suggestion"}
        </button>
      </form>

      {suggestion && (
        <div
          className="mt-4 p-4 rounded-md text-sm leading-relaxed"
          style={{ backgroundColor: "#F5F3FF", color: "#4C1D95" }}
        >
          {suggestion}
        </div>
      )}
    </div>
  );
}