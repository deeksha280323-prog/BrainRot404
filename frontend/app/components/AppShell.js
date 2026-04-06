"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import Navbar from "./Navbar";
import { useAuth } from "../hooks/useAuth";

// Routes that should NOT use the 3-column dashboard layout
const PUBLIC_ROUTES = ["/", "/login", "/register", "/onboarding", "/demo", "/hackathon-mode"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Strict matching for public routes
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If loading auth state, show simple spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If public route or not logged in, show classic layout with top Navbar
  if (isPublicRoute || !user) {
    const showNavbar = pathname !== "/" && pathname !== "";
    return (
      <div className="flex flex-col min-h-screen bg-[var(--background)]">
        {showNavbar && <Navbar />}
        <main className="flex-grow z-10 flex flex-col">{children}</main>
      </div>
    );
  }

  // Authenticated 3-column SaaS layout
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden selection:bg-[#f9ae9b]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-[var(--background)]">
        {children}
      </main>
      <RightPanel />
    </div>
  );
}
