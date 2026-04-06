"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("devmatch_token") : null;
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("devmatch_token");
    localStorage.removeItem("devmatch_user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const navLinks = isLoggedIn
    ? [
        { href: "/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/discover", label: "Discover", icon: "🔍" },
        { href: "/teams", label: "Teams", icon: "👥" },
        { href: "/profile", label: "Profile", icon: "👤" },
        { href: "/hackathon-mode", label: "Hackathon", icon: "🏕️" },
        { href: "/demo", label: "Live Demo", icon: "✨" },
      ]
    : [
        { href: "/hackathon-mode", label: "Join Hackathon", icon: "🏕️" },
        { href: "/demo", label: "Live Demo", icon: "✨" },
      ];

  const isActive = (href) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-[#f0e6e4]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-[#f9ae9b]/20 group-hover:shadow-[#f9ae9b]/40 transition-shadow">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <span className="font-display text-xl font-bold text-[#222] hidden sm:block">
              Dev<span className="text-gradient">Match</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-[#f9ae9b]/10 text-[#f9ae9b]"
                    : "text-slate-500 hover:text-[#f9ae9b] hover:bg-[#f9ae9b]/5"
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="btn-secondary text-sm !py-2 !px-4 hover:shadow-md">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-500 hover:text-[#f9ae9b] transition-colors px-3 py-2 font-medium">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-[#f9ae9b] hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-slate-700/50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-700/50">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800/50 rounded-lg">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-lg">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-indigo-400 font-semibold rounded-lg">
                      Get Started →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
