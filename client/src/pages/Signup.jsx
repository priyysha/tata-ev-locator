import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Car, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const NAVY = "#1B2A56";
const CORAL = "#D85A30";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", evModel: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      login(res.data.user, res.data.token);
      navigate("/stations");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-xl border border-gray-200 px-7 py-8">
        <div className="flex justify-center mb-6 gap-2 items-center">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: NAVY }}>
            <Car size={16} color="#fff" />
          </div>
          <span className="text-[15px] font-medium">Tata.ev Locator</span>
        </div>

        <h1 className="text-xl font-medium text-center mb-1">Create your account</h1>
        <p className="text-[13px] text-gray-500 text-center mb-6">Sign up to get started.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Full name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm" />
          </div>
          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm" />
          </div>
          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full h-9 px-3 pr-10 rounded-md border border-gray-300 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[13px] text-gray-500 block mb-1.5">Your EV model (optional)</label>
            <select name="evModel" value={form.evModel} onChange={handleChange}
              className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm cursor-pointer">
              <option value="">Select model</option>
              <option value="Nexon EV">Nexon EV</option>
              <option value="Punch EV">Punch EV</option>
              <option value="Tiago EV">Tiago EV</option>
              <option value="Curvv EV">Curvv EV</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-md px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-10 mt-2 text-sm rounded-md text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: NAVY }}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-[13px] text-gray-500 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" style={{ color: CORAL }} className="underline">Login</Link>
        </p>
      </div>
    </div>
  );
}