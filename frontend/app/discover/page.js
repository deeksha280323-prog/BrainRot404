"use client";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { getMatches, recordSwipe, getSwipedProfiles, getMe } from "../../lib/api";
import { useRightPanel } from "../contexts/RightPanelContext";

const playfair = Playfair_Display({ subsets: ["latin"] });

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
      className="absolute inset-0 bg-white cursor-grab active:cursor-grabbing overflow-hidden flex flex-col shadow-2xl border border-[#f0e6e4]/60 rounded-[2.5rem] z-10"
      style={{ x, rotate }}
      drag={onSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: Math.sign(x.get()) * 700, opacity: 0, scale: 0.5, rotate: Math.sign(x.get()) * 20 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      {/* Overlays */}
      <motion.div className="absolute top-12 right-10 text-emerald-500 font-bold text-2xl -rotate-12 z-20 border-[3px] border-emerald-500 px-6 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl tracking-widest uppercase" style={{ opacity: likeOpacity }}>
        Sync
      </motion.div>
      <motion.div className="absolute top-12 left-10 text-rose-500 font-bold text-2xl rotate-12 z-20 border-[3px] border-rose-500 px-6 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl tracking-widest uppercase" style={{ opacity: nopeOpacity }}>
        Skip
      </motion.div>

      {/* Hero Header */}
      <div className="h-52 bg-gradient-to-br from-[#fff2ee] to-[#fff8f5] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-10 left-10 w-24 h-24 rounded-[1.75rem] bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-3xl border-4 border-white shadow-2xl overflow-hidden group">
          {user?.profilePicture ? (
            <img src={`http://localhost:5000${user.profilePicture}`} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        
        {/* Compatibility Badge */}
        <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-md border border-[#f9ae9b]/10 px-5 py-2.5 rounded-2xl flex flex-col items-end shadow-xl">
          <div className="text-2xl font-black text-[#f9ae9b] leading-tight">
            {match.matchScore}%
          </div>
          <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Similarity</span>
        </div>
      </div>

      <div className="p-10 flex-grow flex flex-col">
        <div className="mb-8">
          <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-1 flex items-center gap-3`}>
            {user?.name}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            {user?.campus?.college || "Global Talent Ecosystem"}
          </p>
          <div className="flex items-center gap-2 text-[#f9ae9b] bg-[#f9ae9b]/5 w-fit px-3 py-1 rounded-lg">
             <span className="text-xs">📍</span>
             <span className="text-[10px] font-bold uppercase tracking-wider">{user?.state || user?.country || "Earth"}</span>
          </div>
        </div>

        <div className="mb-0">
          <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Neural Stack</h3>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.length > 0 ? (
              user.skills.slice(0, 4).map((s, i) => (
                <span key={i} className="px-3.5 py-1.5 bg-[#fbfbfb] border border-[#f0e6e4]/60 rounded-xl text-[10px] font-bold text-[#666] shadow-sm">
                  {s.name}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-gray-300 italic">No nodes disclosed.</span>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-8 border-t border-[#f0e6e4]/40 flex justify-between items-center text-gray-300">
           <span className="text-[8px] font-bold uppercase tracking-widest">Hash: {user?._id?.slice(-6)}</span>
           <span className="text-[8px] font-bold uppercase tracking-widest">Status: Ready to Sync</span>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileGrid({ items, title, emptyIcon, emptyMessage, onSelect }) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
           <h2 className={`${playfair.className} text-4xl font-bold text-[#222] mb-1`}>{title}</h2>
           <p className="text-[10px] font-black text-[#f9ae9b] uppercase tracking-[0.4em]">{items.length} Archived Nodes</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-40 bg-white border border-dashed border-[#f0e6e4] rounded-[3.5rem] flex flex-col items-center justify-center text-center shadow-inner">
          <span className="text-7xl mb-10 grayscale opacity-10">{emptyIcon}</span>
          <p className="text-[11px] text-gray-300 font-black uppercase tracking-[0.4em]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <motion.div 
              key={item.user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(item.user)}
              className="bg-white border border-[#f0e6e4]/60 rounded-[2.5rem] overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-[#f9ae9b]/10 transition-all group"
            >
              <div className="h-28 bg-gradient-to-br from-[#fff2ee] to-[#fff8f5] flex items-center px-8 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#f9ae9b] font-black text-xl shadow-lg border border-[#f9ae9b]/10 overflow-hidden">
                  {item.user.profilePicture ? (
                    <img src={`http://localhost:5000${item.user.profilePicture}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.user.name.charAt(0)
                  )}
                </div>
                <div className="ml-5 min-w-0">
                   <h4 className="font-bold text-[#222] text-sm truncate">{item.user.name}</h4>
                   <p className="text-[9px] text-[#f9ae9b] font-bold uppercase tracking-wider">{item.matchScore}% Match</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { setPanelData } = useRightPanel();
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("swipe"); 
  const [swipedLists, setSwipedLists] = useState({ accepted: [], rejected: [] });

  // Filters
  const [filterState, setFilterState] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [prioritizeState, setPrioritizeState] = useState(false);

  useEffect(() => {
    fetchMe();
    fetchMatches();
    fetchSwiped();
  }, [filterCountry]);

  const fetchMe = () => {
    getMe().then(res => setMe(res.data)).catch(() => {});
  };

  const fetchMatches = () => {
    setLoading(true);
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }
    
    const params = {};
    if (filterCountry) params.country = filterCountry;
    if (prioritizeState && filterState) params.state = filterState;

    getMatches(params)
      .then((res) => {
        setMatches(res.data || []);
        setCurrentIdx(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchSwiped = () => {
    getSwipedProfiles()
      .then((res) => setSwipedLists(res.data))
      .catch(() => {});
  };

  const applyFilters = () => { fetchMatches(); };

  useEffect(() => {
    if (viewMode === "swipe") {
      if (matches.length > 0 && currentIdx < matches.length) {
        setPanelData({ user: matches[currentIdx].user });
      } else {
        setPanelData(null);
      }
    }
  }, [matches, currentIdx, viewMode, setPanelData]);

  const handleSwipe = async (direction, targetUserId) => {
    try {
      await recordSwipe({ targetUserId, action: direction === "super" ? "right" : direction });
      fetchSwiped(); 
    } catch (err) { console.error(err); }
    setCurrentIdx((prev) => prev + 1);
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center bg-[#fefcfb]">
      <div className="w-12 h-12 border-[3px] border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const remaining = matches.slice(currentIdx);
  const allSwiped = remaining.length === 0;
  const noUserProfile = !me?.skills || me.skills.length === 0;

  return (
    <div className="min-h-full flex flex-col p-12 bg-[#fefcfb]">
      
      {/* Upper Management: Sync Feed vs Discover Controls */}
      <div className="max-w-6xl mx-auto w-full mb-16">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-rose-100">Live Feedback</span>
                <h1 className={`${playfair.className} text-5xl font-bold text-[#222]`}>Discovery <span className="text-[#f9ae9b]">Engine</span></h1>
             </div>
             <p className="text-gray-400 text-sm font-medium">Capture high-synergy participants for your next transmission.</p>
          </div>

          <div className="flex flex-col items-end gap-4">
             {/* Recent Syncs Row (The "Showing Syncs" Fix) */}
             {swipedLists.accepted.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                   <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mr-4">Recent Syncs</p>
                   <div className="flex -space-x-3">
                      {swipedLists.accepted.slice(0, 5).map((sync, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#f9ae9b] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md">
                           {sync.user.profilePicture ? (
                             <img src={`http://localhost:5000${sync.user.profilePicture}`} className="w-full h-full object-cover" alt="" />
                           ) : (
                             sync.user.name.charAt(0)
                           )}
                        </div>
                      ))}
                      {swipedLists.accepted.length > 5 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold shadow-md">
                          +{swipedLists.accepted.length - 5}
                        </div>
                      )}
                   </div>
                </div>
             )}

            <div className="flex bg-[#fcefec]/50 p-1.5 rounded-[1.75rem] border border-[#f9ae9b]/10 shadow-inner">
              {["swipe", "accepted", "rejected"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                    viewMode === mode 
                      ? "bg-white text-[#f9ae9b] shadow-xl shadow-[#f9ae9b]/10 ring-1 ring-[#f9ae9b]/5" 
                      : "text-gray-400 hover:text-[#f9ae9b]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "swipe" ? (
          <motion.div 
            key="swipe-canvas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col lg:flex-row items-start justify-center gap-16 max-w-6xl mx-auto w-full"
          >
            {/* Left Column: Filters & Status */}
            <div className="w-full lg:w-80 flex flex-col gap-10 sticky top-12">
               <div className="bg-white p-8 rounded-[2.5rem] border border-[#f0e6e4]/60 shadow-2xl shadow-[#f9ae9b]/5">
                  <h3 className="text-[10px] font-black text-[#f9ae9b] uppercase tracking-[0.4em] mb-8">Node Filtration</h3>
                  <div className="flex flex-col gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Country Node</label>
                        <input 
                           type="text" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
                           className="w-full bg-[#fbfbfb] border border-[#f0e6e4]/60 rounded-2xl px-5 py-3.5 text-sm focus:ring-1 focus:ring-[#f9ae9b]/20 outline-none transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">State Vector</label>
                        <input 
                           type="text" value={filterState} onChange={(e) => setFilterState(e.target.value)}
                           className="w-full bg-[#fbfbfb] border border-[#f0e6e4]/60 rounded-2xl px-5 py-3.5 text-sm focus:ring-1 focus:ring-[#f9ae9b]/20 outline-none transition-all"
                        />
                     </div>
                     <div className="pt-4">
                        <button onClick={applyFilters} className="w-full py-4 bg-[#f9ae9b] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-[#f9ae9b]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Re-Sync Vectors</button>
                     </div>
                  </div>
               </div>

               {noUserProfile && (
                 <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col gap-4">
                    <span className="text-xl">⚠️</span>
                    <h4 className="font-bold text-[#b45309] text-sm italic">Neural Link Weak</h4>
                    <p className="text-[11px] text-[#b45309]/70 leading-relaxed font-medium">Your skill matrix is empty. Similarity scores will default to 0%. Update your profile for accurate syncing.</p>
                    <button onClick={() => router.push("/profile")} className="text-[9px] font-black text-[#b45309] uppercase tracking-widest mt-2 hover:underline">Complete Profile</button>
                 </div>
               )}
            </div>

            {/* Center Column: The Deck */}
            <div className="flex-grow flex flex-col items-center">
               <div className="relative w-full max-w-sm h-[520px] mb-12 select-none">
                 {allSwiped ? (
                   <div className="absolute inset-0 bg-white border-2 border-dashed border-[#f0e6e4] rounded-[3.5rem] flex flex-col items-center justify-center p-16 text-center shadow-inner">
                     <span className="text-7xl mb-10 grayscale opacity-10">📡</span>
                     <h3 className={`${playfair.className} text-3xl font-bold text-[#222] mb-6`}>Beyond Reach</h3>
                     <p className="text-xs text-gray-300 font-medium leading-relaxed max-w-xs">You've reached the current boundary of the participant pool.</p>
                     <button onClick={() => { setFilterCountry(""); setFilterState(""); fetchMatches(); }} className="mt-10 text-[9px] font-black text-[#f9ae9b] uppercase tracking-[0.4em]">Reset Discovery</button>
                   </div>
                 ) : (
                   <AnimatePresence>
                     {remaining.slice(0, 3).reverse().map((match, i, arr) => {
                       const isTop = i === arr.length - 1;
                       return (
                         <motion.div 
                           key={match.user._id} 
                           className="absolute inset-0"
                           style={{ zIndex: i + 1 }}
                           animate={{ scale: isTop ? 1 : 1 - (arr.length - 1 - i) * 0.05, y: isTop ? 0 : (arr.length - 1 - i) * 15, opacity: isTop ? 1 : 0.2 }}
                         >
                           <SwipeCard match={match} onSwipe={isTop ? handleSwipe : null} />
                         </motion.div>
                       );
                     })}
                   </AnimatePresence>
                 )}
               </div>

               {/* Interaction Controls */}
               {!allSwiped && (
                 <div className="flex items-center gap-10">
                   <button onClick={() => handleSwipe("left", remaining[0].user._id)} className="w-20 h-20 rounded-full bg-white border border-[#f0e6e4]/80 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-2xl shadow-rose-500/5 active:scale-90">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                   <button onClick={() => handleSwipe("super", remaining[0].user._id)} className="w-16 h-16 rounded-full bg-white border border-[#f0e6e4]/80 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-2xl active:scale-90">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                   </button>
                   <button onClick={() => handleSwipe("right", remaining[0].user._id)} className="w-20 h-20 rounded-full bg-[#f9ae9b] flex items-center justify-center text-white hover:bg-[#fac2b4] transition-all shadow-2xl shadow-[#f9ae9b]/20 active:scale-90">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                   </button>
                 </div>
               )}
            </div>
          </motion.div>
        ) : viewMode === "accepted" ? (
          <ProfileGrid items={swipedLists.accepted} title="Accepted Nodes" emptyIcon="🤝" emptyMessage="No confirmed syncs archived." onSelect={u => setPanelData({user:u})} />
        ) : (
          <ProfileGrid items={swipedLists.rejected} title="Filtered Vectors" emptyIcon="🛡️" emptyMessage="No vectors filtered yet." onSelect={u => setPanelData({user:u})} />
        )}
      </AnimatePresence>

      <div className="mt-auto pt-20 border-t border-[#f0e6e4]/40 flex justify-center">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] opacity-30">
           Neural Sync Network 1.2.5
         </p>
      </div>
    </div>
  );
}
