"use client";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMatches, recordSwipe } from "../../lib/api";
import { useRightPanel } from "../contexts/RightPanelContext";

function SwipeCard({ match, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) {
      onSwipe("right", match.user._id);
    } else if (info.offset.x < -120) {
      onSwipe("left", match.user._id);
    }
  };

  const user = match.user;

  return (
    <motion.div
      className="absolute inset-0 bg-white cursor-grab active:cursor-grabbing overflow-hidden flex flex-col shadow-2xl border border-[#f0e6e4]/60 rounded-[2.5rem]"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: Math.sign(x.get()) * 500, opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Overlays */}
      <motion.div className="absolute top-12 right-10 text-emerald-500 font-bold text-2xl -rotate-12 z-20 border-[3px] border-emerald-500 px-6 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl tracking-widest uppercase" style={{ opacity: likeOpacity }}>
        Sync
      </motion.div>
      <motion.div className="absolute top-12 left-10 text-rose-500 font-bold text-2xl rotate-12 z-20 border-[3px] border-rose-500 px-6 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl tracking-widest uppercase" style={{ opacity: nopeOpacity }}>
        Skip
      </motion.div>

      {/* Hero Header */}
      <div className="h-56 bg-gradient-to-br from-[#fff2ee] to-[#fff8f5] relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-10 left-10 w-28 h-28 rounded-[2rem] bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-4xl border-4 border-white shadow-2xl overflow-hidden group">
          {user?.profilePicture ? (
            <img src={`http://localhost:5000${user.profilePicture}`} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        
        {/* Compatibility Badge */}
        <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-md border border-[#f9ae9b]/10 px-5 py-2.5 rounded-2xl flex flex-col items-end shadow-xl">
          <div className="text-2xl font-bold text-[#f9ae9b] leading-tight">
            {match.matchScore}%
          </div>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Similarity</span>
        </div>
      </div>

      <div className="pt-16 px-10 pb-10 flex-grow flex flex-col">
        <div className="mb-8">
          <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-2 flex items-center gap-3`}>
            {user?.name}
            {user?.experienceLevel?.overall === "Expert" && <span className="w-2 h-2 rounded-full bg-[#f9ae9b]"></span>}
          </h2>
          <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mb-2">
            {user?.campus?.college || "Global Talent Pool"}
          </p>
          {(user?.state || user?.country) && (
            <p className="text-xs text-[#f9ae9b] font-bold uppercase tracking-[0.1em]">📍 {user.state}{user.state && user.country ? ', ' : ''}{user.country}</p>
          )}
        </div>

        <div className="mb-0">
          <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-4">Core Stack</h3>
          <div className="flex flex-wrap gap-2.5">
            {user?.skills?.slice(0, 5).map((s, i) => (
              <span key={i} className="px-3.5 py-1.5 bg-[#fbfbfb] border border-[#f0e6e4]/60 rounded-xl text-[11px] font-bold text-[#666] shadow-sm hover:border-[#f9ae9b]/30 transition-colors">
                {s.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-8 border-t border-[#f0e6e4]/40 flex justify-between items-center text-gray-300">
           <span className="text-[9px] font-bold uppercase tracking-widest">Profile Vector: {user?._id?.slice(-8)}</span>
           <span className="text-[9px] font-bold uppercase tracking-widest">Recency: Active</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { setPanelData } = useRightPanel();
  const [matches, setMatches] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterState, setFilterState] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [prioritizeState, setPrioritizeState] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [filterCountry]); // Fetch automatically on big region change, but prioritize/state logic is handled in fetch

  const fetchMatches = () => {
    setLoading(true);
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }
    
    const params = {};
    if (filterCountry) params.country = filterCountry;
    // If prioritize state toggle is ON, we strictly search for users in that state
    if (prioritizeState && filterState) params.state = filterState;

    getMatches(params)
      .then((res) => {
        setMatches(res.data || []);
        setCurrentIdx(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Trigger manual fetch on toggle or state string change 
  const applyFilters = () => { fetchMatches(); };

  // Sync the current top match with the Right Panel context
  useEffect(() => {
    if (matches.length > 0 && currentIdx < matches.length) {
      setPanelData({ user: matches[currentIdx].user });
    } else {
      setPanelData(null);
    }
  }, [matches, currentIdx, setPanelData]);

  const handleSwipe = async (direction, targetUserId) => {
    try {
      // "Super match" routes to right swipe internally
      await recordSwipe({ targetUserId, action: direction === "super" ? "right" : direction });
    } catch (err) { console.error(err); }
    setCurrentIdx((prev) => prev + 1);
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const remaining = matches.slice(currentIdx);
  const allSwiped = remaining.length === 0;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      
      {/* Location Filter Panel */}
      <div className="w-full max-w-4xl mb-12 p-6 bg-white border border-[#f0e6e4]/60 rounded-[2rem] shadow-xl shadow-[#f9ae9b]/5 z-30">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <span className="text-[10px] font-bold text-[#f9ae9b] uppercase tracking-[0.2em] whitespace-nowrap">Location Filters</span>
            <input 
              type="text" 
              placeholder="Country" 
              className="input-light !py-2 !px-4 text-xs w-full sm:w-32 border-[#eee]"
              value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="State" 
              className="input-light !py-2 !px-4 text-xs w-full sm:w-32 border-[#eee]"
              value={filterState} onChange={(e) => setFilterState(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
            <label className="flex items-center gap-3 cursor-pointer relative group">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={prioritizeState} onChange={(e) => setPrioritizeState(e.target.checked)}
              />
              <div className="w-10 h-5 bg-[#eee] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f9ae9b]"></div>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-[#f9ae9b] transition-colors uppercase tracking-widest">Prioritize Region</span>
            </label>
            <button onClick={applyFilters} className="btn-secondary !py-2 !px-6 !text-[11px] font-bold uppercase tracking-widest shadow-md active:scale-95">Apply</button>
          </div>
        </div>
      </div>

      {/* Centered Main Area */}
      <div className="w-full max-w-sm flex flex-col items-center">
        
        <div className="relative w-full h-[520px] mb-12 select-none">
          {allSwiped ? (
            <div className="absolute inset-0 bg-white border-2 border-dashed border-[#f0e6e4] rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center shadow-inner">
              <span className="text-5xl mb-6 grayscale opacity-30">✨</span>
              <h3 className={`${playfair.className} text-2xl font-bold text-[#222] mb-3`}>Quiet Orbit</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">You've explored all current vectors in this region. Check back after the next sync.</p>
              <button 
                onClick={() => { setFilterCountry(""); setFilterState(""); setPrioritizeState(false); fetchMatches(); }}
                className="mt-8 text-[11px] font-bold text-[#f9ae9b] uppercase tracking-widest hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {remaining.slice(0, 3).reverse().map((match, i, arr) => {
                const isTop = i === arr.length - 1;
                if (!isTop) {
                  const zIndex = i;
                  const scale = 1 - (arr.length - 1 - i) * 0.05;
                  const yOffset = (arr.length - 1 - i) * 20;
                  
                  return (
                    <motion.div 
                      key={`bg-${match.user._id}`}
                      className="absolute inset-0 pointer-events-none"
                      initial={false}
                      animate={{ scale, y: yOffset, opacity: 0.5 }}
                      style={{ zIndex }}
                    >
                      <SwipeCard key={match.user?._id} match={match} onSwipe={() => {}} />
                    </motion.div>
                  );
                }
                
                return (
                  <motion.div key={match.user?._id} className="absolute inset-0" style={{ zIndex: 10 }}>
                    <SwipeCard match={match} onSwipe={handleSwipe} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Action Controls */}
        {!allSwiped && (
          <div className="flex items-center gap-8">
            <button 
              onClick={() => handleSwipe("left", remaining[0].user._id)}
              className="w-16 h-16 rounded-full bg-white border border-[#f0e6e4]/80 flex items-center justify-center text-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 text-gray-300 transition-all shadow-xl shadow-[#f9ae9b]/5 active:scale-90"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <button 
              onClick={() => handleSwipe("super", remaining[0].user._id)}
              className="w-14 h-14 rounded-full bg-white border border-[#f0e6e4]/80 flex items-center justify-center text-lg hover:bg-amber-50 hover:border-amber-200 hover:text-amber-500 text-gray-300 transition-all shadow-xl shadow-[#f9ae9b]/5 active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button 
              onClick={() => handleSwipe("right", remaining[0].user._id)}
              className="w-16 h-16 rounded-full bg-[#f9ae9b] flex items-center justify-center text-xl hover:bg-[#fac2b4] text-white transition-all shadow-xl shadow-[#f9ae9b]/20 active:scale-90"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </button>
          </div>
        )}

        <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
          Neural Matching Engine
        </p>

      </div>
    </div>
  );
}
