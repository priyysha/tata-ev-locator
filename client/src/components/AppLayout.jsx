import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, MapPin, Calendar, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";
import ConfirmModal from "./ConfirmModal";
import HelpGuide from "./HelpGuide";

const NAVY = "#1B2A56";

const NAV_ITEMS = [
  { label: "Stations", path: "/stations", icon: MapPin },
  { label: "My Bookings", path: "/bookings", icon: Calendar },
  { label: "Profile", path: "/profile", icon: User },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-200 z-50 ${
          sidebarOpen ? "w-60" : "w-0 md:w-16"
        } overflow-hidden`}
      >
        <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200 shrink-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: NAVY }}>
            <Zap size={16} color="#fff" />
          </div>
          {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Tata.ev Locator</span>}
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-3 h-10 rounded-md text-sm whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: active ? NAVY : "transparent",
                  color: active ? "white" : undefined,
                }}
              >
                <Icon size={16} className={active ? "" : "text-gray-500"} />
                {sidebarOpen && (
                  <span className={active ? "" : "text-gray-700"}>{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4">
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="flex items-center gap-3 px-3 h-10 rounded-md text-sm text-red-600 hover:bg-red-50 whitespace-nowrap w-full cursor-pointer"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 cursor-pointer"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
        </div>

        <main className="flex-1">{children}</main>

        <Footer />
      </div>

      <HelpGuide />

      <ConfirmModal
        open={logoutConfirmOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, log out"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          logout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}