"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMatches, getSwipedProfiles } from "../../lib/api";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

const MOCK_ACCEPTED = [
  {
    user: {
      _id: "mock1",
      name: "Aisha Sharma",
      campus: { college: "Thapar Institute" },
      skills: [{ name: "React" }, { name: "Next.js" }, { name: "Tailwind" }]
    },
    matchScore: 98
  },
  {
    user: {
      _id: "mock2",
      name: "Alex Rivera",
      campus: { college: "Stanford University" },
      skills: [{ name: "Figma" }, { name: "UI/UX" }, { name: "React" }]
    },
    matchScore: 92
  },
  {
    user: {
      _id: "mock3",
      name: "Rishi Singh",
      campus: { college: "PEC" },
      skills: [{ name: "Rust" }, { name: "Python" }, { name: "NLP" }]
    },
    matchScore: 89
  }
];

export default function MatchesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("accepted"); // accepted, suggestions
  const [recommendations, setRecommendations] = useState([]);
  const [acceptedSyncs, setAcceptedSyncs] = useState([]);

  const fetchData = async () => {
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }
    
    setLoading(true);
    try {
      const [recRes, swipedRes] = await Promise.all([
        getMatches(),
        getSwipedProfiles()
      ]);
      setRecommendations(recRes.data || []);
      setAcceptedSyncs(swipedRes.data.accepted || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="w-10 h-10 border-[3px] border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Use mock data if real data is empty
  const displayItems = viewMode === "accepted" 
    ? (acceptedSyncs.length > 0 ? acceptedSyncs : MOCK_ACCEPTED)
    : recommendations;

  const isUsingMock = viewMode === "accepted" && acceptedSyncs.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-10 py-16 h-full bg-[#fefcfb]">
      <div className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className={`${playfair.className} text-5xl font-bold text-[#222] mb-3`}>Your Neural Matches</h1>
           <p className="text-gray-400 text-[15px] font-medium max-w-xl">Review and manage your high-compatibility synchronizations across the developer network.</p>
        </div>

        <div className="flex bg-[#fcefec]/50 p-1.5 rounded-2xl border border-[#f9ae9b]/10 shadow-inner">
          <button
            onClick={() => setViewMode("accepted")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              viewMode === "accepted" 
                ? "bg-white text-[#f9ae9b] shadow-xl shadow-[#f9ae9b]/10" 
                : "text-gray-400 hover:text-[#f9ae9b]"
            }`}
          >
            Accepted Syncs
          </button>
          <button
            onClick={() => setViewMode("suggestions")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              viewMode === "suggestions" 
                ? "bg-white text-[#f9ae9b] shadow-xl shadow-[#f9ae9b]/10" 
                : "text-gray-400 hover:text-[#f9ae9b]"
            }`}
          >
            AI Suggestions
          </button>
        </div>
      </div>

      {isUsingMock && (
        <div className="mb-10 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg">💡</span>
              <p className="text-[11px] text-rose-500 font-bold uppercase tracking-widest leading-relaxed">
                Visualizing Demo Syncs: You haven't swiped on anyone yet. Here's a preview of how your matches will appear.
              </p>
            </div>
            <button onClick={() => router.push("/discover")} className="px-6 py-2 bg-white text-[#f9ae9b] text-[9px] font-black border border-rose-200 rounded-xl uppercase tracking-widest shadow-sm hover:bg-rose-100 transition-colors">Start Discovering</button>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-32 bg-white border border-dashed border-[#f0e6e4] rounded-[3rem] shadow-inner">
          <span className="text-6xl block mb-8 grayscale opacity-20">{viewMode === 'accepted' ? '🤝' : '📡'}</span>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            {viewMode === 'accepted' ? 'No confirmed pairings detected yet.' : 'Neural stream empty. Broaden your skill vectors.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayItems.map((item, i) => {
            const user = item.user || item;
            const score = item.matchScore;
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-[#f0e6e4]/60 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-2xl shadow-[#f9ae9b]/5 hover:-translate-y-2 transition-all group duration-500"
              >
                <div className={`absolute top-8 right-8 text-[9px] font-black px-3 py-1.5 rounded-xl border tracking-widest uppercase ${
                  score >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  score >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                  "bg-gray-50 text-gray-400 border-gray-100"
                }`}>
                  {score}% COMPATIBILITY
                </div>

                <div className="flex items-center gap-6 mb-10 mt-2">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-3xl shrink-0 shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                    ) : (
                      user?.name?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 pr-12">
                    <h3 className={`${playfair.className} font-bold text-[#222] text-2xl truncate mb-1`}>{user?.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{user?.campus?.college || "Global Talent Node"}</p>
                  </div>
                </div>

                <div className="mb-10 flex-grow">
                  <p className="text-[9px] font-black text-gray-300 mb-4 uppercase tracking-[0.25em]">Neural Intersections</p>
                  <div className="flex flex-wrap gap-2.5">
                    {user?.skills?.slice(0, 4).map((s, j) => (
                      <span key={j} className="text-[11px] px-4 py-2 rounded-xl bg-[#fbfbfb] text-[#555] border border-[#f0e6e4]/60 font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-grow py-4 bg-[#f9ae9b] hover:bg-[#fac2b4] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-xl shadow-[#f9ae9b]/20">
                    Initiate Neural Sync
                  </button>
                  <button className="px-5 py-4 bg-white border border-[#f0e6e4] text-gray-300 rounded-2xl hover:text-[#f9ae9b] hover:border-[#f9ae9b]/30 transition-all shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
