import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-medium">Tata.ev Charging Station Locator</h1>
      <div className="flex gap-3">
        <Link to="/login" className="h-9 px-5 flex items-center text-sm rounded-md border border-gray-300">Login</Link>
        <Link to="/signup" className="h-9 px-5 flex items-center text-sm rounded-md text-white" style={{ backgroundColor: "#1B2A56" }}>Sign up</Link>
      </div>
    </div>
  );
}