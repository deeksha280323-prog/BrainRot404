"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/discover", label: "Discover", icon: "🔍" },
  { href: "/matches", label: "Matches", icon: "⭐" },
  { href: "/teams", label: "Teams", icon: "👥" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/hackathon-mode", label: "Hackathon Mode", icon: "🏕️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-full hidden lg:flex flex-col border-r border-[#ffe8e0] bg-[#fefcfb]/95 backdrop-blur-xl shrink-0 supports-[backdrop-filter]:bg-[#fefcfb]/80">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#ffe8e0] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg shadow-[#f9ae9b]/40">
            <span className="text-white font-bold text-xs">DM</span>
          </div>
          <span className="font-display font-bold text-lg text-[#222]">
            Dev<span className="text-[#f9ae9b]">Match</span>
          </span>
        </Link>
      </div>

      {/* User Mini Card */}
      <div className="px-4 py-6 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Loading..."}</p>
            <p className="text-xs text-slate-400 truncate">{user?.experienceLevel?.overall || "Developer"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-2">Menu</p>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_2px_0_0_0_#818cf8]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span className={`text-base ${isActive ? "opacity-100" : "opacity-70 grayscale"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="opacity-70 grayscale">🚪</span>
          Log out
        </button>
      </div>

    </div>
  );
}
