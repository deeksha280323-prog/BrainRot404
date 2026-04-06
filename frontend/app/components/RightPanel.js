"use client";
import { useRightPanel } from "../contexts/RightPanelContext";
import { motion, AnimatePresence } from "framer-motion";

export default function RightPanel() {
  const { panelData } = useRightPanel();
  const user = panelData?.user;

  if (!user) {
    return (
      <div className="w-80 h-full hidden xl:flex flex-col border-l border-[#ffe8e0] bg-[#fefcfb]/95 backdrop-blur-xl shrink-0 items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 border border-[#ffe8e0]">
          <span className="text-2xl opacity-50">✨</span>
        </div>
        <p className="text-sm font-medium text-[#444] mb-1">No Profile Selected</p>
        <p className="text-xs text-[#777]">Swipe or select a developer to view detailed stats here.</p>
      </div>
    );
  }

  return (
    <div className="w-80 h-full hidden xl:flex flex-col border-l border-[#ffe8e0] bg-[#fefcfb]/95 backdrop-blur-xl shrink-0 overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="wait">
        <motion.div
          key={user._id || user.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#f9ae9b] to-[#fac2b4] flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-[#f9ae9b]/20 mb-4 border border-[#f9ae9b]/40 overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0) || "?"
              )}
            </div>
            <h2 className="text-lg font-bold text-[#222]">{user.name}</h2>
            <p className="text-sm text-[#f9ae9b] font-medium mt-1">{user.experienceLevel?.overall || "Developer"}</p>
          </div>

          {/* Bio Box */}
          <div className="bg-white rounded-2xl p-4 border border-[#ffe8e0] shadow-sm">
            <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-[#444] leading-relaxed">
              {user.bio || "No bio provided."}
            </p>
          </div>

          {/* Campus Details */}
          {user.campus && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Campus</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">🎓</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{user.campus.college || "N/A"}</p>
                    <p className="text-xs text-slate-500">University</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">📍</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {user.campus.city}{user.campus.region ? `, ${user.campus.region}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">Location</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills with Progress Bars */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Skill Proficiency</h3>
            <div className="space-y-4">
              {user.skills?.length > 0 ? user.skills.map((s, i) => {
                const getWidth = (lvl) => {
                  if(lvl === 'Expert') return '100%';
                  if(lvl === 'Advanced') return '75%';
                  if(lvl === 'Intermediate') return '50%';
                  return '25%';
                };
                const getColor = (lvl) => {
                  if(lvl === 'Expert') return 'bg-orange-500';
                  if(lvl === 'Advanced') return 'bg-purple-500';
                  if(lvl === 'Intermediate') return 'bg-blue-500';
                  return 'bg-green-500';
                };
                
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-300">{s.name}</span>
                      <span className="text-slate-500">{s.level}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: getWidth(s.level) }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full rounded-full ${getColor(s.level)}`}
                      ></motion.div>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-xs text-slate-500 italic">No skills listed</p>
              )}
            </div>
          </div>

          {/* Mocked GitHub Stats */}
          <div className="bg-white rounded-2xl p-4 border border-[#ffe8e0] shadow-sm">
            <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3 flex items-center justify-between">
              GitHub Stats <span className="text-[10px] bg-[#f9ae9b]/20 px-1.5 py-0.5 rounded text-[#f9ae9b] font-mono">Mock</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                <span className="block text-lg font-bold text-slate-200">241</span>
                <span className="text-[10px] text-slate-500 uppercase">Commits</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                <span className="block text-lg font-bold text-slate-200">12</span>
                <span className="text-[10px] text-slate-500 uppercase">Repos</span>
              </div>
            </div>
            {/* Fake Contribution Graph */}
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, r) => (
                <div key={r} className="flex gap-1">
                  {[...Array(12)].map((_, c) => {
                    const activity = Math.random();
                    let color = "bg-slate-800";
                    if(activity > 0.8) color = "bg-green-400";
                    else if(activity > 0.5) color = "bg-green-600";
                    else if(activity > 0.3) color = "bg-green-800";
                    
                    return <div key={c} className={`w-3 h-3 rounded-sm ${color} opacity-80`}></div>
                  })}
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
