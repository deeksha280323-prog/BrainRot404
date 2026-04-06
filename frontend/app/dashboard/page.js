"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, getMatches } from "../../lib/api";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ matches: 0, views: 0 });
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devmatch_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user and stats
    getMe()
      .then((res) => {
        if (!res.data.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
        setUser(res.data);
        setStats({ matches: 12, views: 48 }); // Mock stats
      })
      .catch((err) => {
        console.error(err);
        router.push("/login");
      })
      .finally(() => setLoading(false));

    // Fetch top matches
    getMatches()
      .then((res) => {
        setTopMatches((res.data || []).slice(0, 3));
      })
      .catch(() => {});
  }, [router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 h-full flex flex-col">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="linear-card p-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-[#f9ae9b]/5"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#f9ae9b]/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <h1 className={`${playfair.className} text-4xl font-bold text-[#222] mb-3`}>
            Welcome back, <span className="text-[#f9ae9b]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 text-[15px] max-w-xl font-medium leading-relaxed">
            You've appeared in <strong className="text-[#f9ae9b]">{stats.views}</strong> developer searches this week. Your skill vector remains highly competitive in the AI/ML track.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 relative z-10">
          <Link href="/discover" className="btn-primary !py-4 !px-8 shadow-xl shadow-[#f9ae9b]/30 hover:-translate-y-1 transition-all active:scale-95">
            Start Matching 🚀
          </Link>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-10 flex-grow">
        
        {/* Left Col: Matches Preview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-[#f9ae9b] uppercase tracking-[0.2em]">Top Compatible Matches</h2>
            <div className="h-[1px] flex-grow mx-6 bg-[#f0e6e4]/40"></div>
            <Link href="/matches" className="text-[11px] font-bold text-gray-400 hover:text-[#f9ae9b] transition-colors uppercase tracking-widest">View all →</Link>
          </div>
          
          <div className="space-y-5">
            {topMatches.length > 0 ? topMatches.map((match, i) => (
              <motion.div 
                key={match.user._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#f0e6e4]/60 p-6 rounded-3xl flex items-center justify-between hover:border-[#f9ae9b]/40 hover:shadow-xl hover:shadow-[#f9ae9b]/5 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-xl shadow-inner border border-[#f9ae9b]/10">
                    {match.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#222] text-lg mb-1">{match.user?.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{match.user?.experienceLevel?.overall || "Developer"}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <p className="text-xs text-gray-400 truncate max-w-[200px] font-medium">{match.user?.bio || "No bio available"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-display text-[#f9ae9b]">{match.matchScore}</span>
                      <span className="text-[10px] font-bold text-[#f9ae9b]/60">%</span>
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.15em] mt-1">Similarity</p>
                  </div>
                  <button className="w-10 h-10 rounded-2xl bg-[#fbfbfb] border border-[#eee] flex items-center justify-center hover:bg-[#f9ae9b] hover:text-white hover:border-[#f9ae9b] transition-all shadow-sm">
                    💬
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="bg-[#fbfbfb] border border-dashed border-[#eee] p-12 rounded-[2.5rem] text-center">
                <span className="text-4xl opacity-20 block mb-4">✨</span>
                <p className="text-gray-400 text-sm font-medium italic">Your vector pairings are being computed...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Stats & Radar */}
        <div className="space-y-8">
          <div className="linear-card p-8 shadow-lg shadow-[#f9ae9b]/5">
            <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.2em] mb-6">Vector Activity</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-[#fbfbfb] rounded-2xl p-5 border border-[#eee] text-center shadow-sm">
                <span className="block text-3xl font-display font-bold text-[#222] mb-1">{stats.matches}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">New Syncs</span>
              </div>
              <div className="bg-[#fbfbfb] rounded-2xl p-5 border border-[#eee] text-center shadow-sm">
                <span className="block text-3xl font-display font-bold text-[#222] mb-1">{user?.skills?.length || 0}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Skill Nodes</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#f0e6e4]/60">
              <Link href="/profile" className="w-full block text-center py-3.5 bg-white hover:bg-gray-50 rounded-2xl text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.15em] transition-all border border-[#f0e6e4]/80 shadow-sm active:scale-95">
                Update Skill Graph
              </Link>
            </div>
          </div>

          <div className="linear-card p-8 border-[#f9ae9b]/10 bg-gradient-to-br from-[#fcefec] to-white shadow-xl shadow-[#f9ae9b]/5">
            <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.2em] mb-4">Matching Status</h2>
            <p className="text-[13px] text-gray-400 mb-6 font-medium leading-relaxed">
              Your profile is currently <strong className="text-[#f9ae9b]">Visible</strong> in the global developer pool.
            </p>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm self-start px-4 py-2.5 rounded-full border border-[#f9ae9b]/20 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Active Discovery</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
