"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMatches } from "../../lib/api";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }
    
    getMatches()
      .then((res) => setMatches(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 h-full">
      <div className="mb-12">
        <h1 className={`${playfair.className} text-4xl font-bold text-[#222] mb-3`}>Your Neural Matches</h1>
        <p className="text-gray-400 text-[15px] font-medium">Review your highest compatibility developers based on vector similarity scores.</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-24 bg-white border border-dashed border-[#f0e6e4] rounded-[2.5rem] shadow-inner">
          <span className="text-5xl block mb-6 grayscale opacity-30">🔍</span>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No vector pairings detected yet.</p>
          <p className="text-sm text-gray-300 mt-2">Complete your profile to synchronize with the global talent pool.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {matches.map((match, i) => {
            const user = match.user;
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-[#f0e6e4]/60 p-8 rounded-3xl flex flex-col relative overflow-hidden shadow-xl shadow-[#f9ae9b]/5 hover:-translate-y-1 transition-all group"
              >
                {/* Score badge top right */}
                <div className={`absolute top-6 right-6 text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
                  match.matchScore >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  match.matchScore >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                  "bg-gray-50 text-gray-400 border-gray-100"
                }`}>
                  {match.matchScore}% Compatibility
                </div>

                <div className="flex items-center gap-6 mb-8 mt-2">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-2xl shrink-0 shadow-inner border border-[#f9ae9b]/10 group-hover:scale-110 transition-transform">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-12">
                    <h3 className="font-bold text-[#222] text-xl truncate mb-1">{user?.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{user?.campus?.college || "Global Talent"}</p>
                  </div>
                </div>

                <div className="mb-8 flex-grow">
                  <p className="text-[10px] font-black text-gray-300 mb-4 uppercase tracking-[0.2em]">Neural Intersections</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.slice(0, 4).map((s, j) => (
                      <span key={j} className="text-[11px] px-3 py-1.5 rounded-xl bg-[#fbfbfb] text-[#555] border border-[#f0e6e4]/60 font-medium">
                        {s.name}
                      </span>
                    ))}
                    {user?.skills?.length > 4 && (
                      <span className="text-[11px] px-3 py-1.5 text-gray-300 font-bold">+{user.skills.length - 4} More</span>
                    )}
                  </div>
                </div>

                <button className="w-full py-4 bg-white hover:bg-gray-50 text-[#f9ae9b] text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl border border-[#f0e6e4] transition-all active:scale-95 shadow-sm">
                  Initiate Sync
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
