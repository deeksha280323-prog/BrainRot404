"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { joinHackathon, getHackathonMatches, getSuggestedTeams, demoCompare } from "../../lib/api";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

const MOCK_SKILLS = ["React", "Python", "Node.js", "MongoDB", "Figma", "AWS"];

const MOCK_LEADERBOARD = [
  { user1: { _id: "m1", name: "Aisha Sharma", skills: [1,2,3] }, user2: { _id: "m2", name: "Alex Rivera", skills: [1,2,3] }, score: 98 },
  { user1: { _id: "m3", name: "Rishi Singh", skills: [1,2] }, user2: { _id: "m4", name: "Sarah Chen", skills: [1,2] }, score: 95 },
  { user1: { _id: "m5", name: "Rahul Verma", skills: [1,2,3,4] }, user2: { _id: "m6", name: "Priya Patel", skills: [1,2,3] }, score: 87 },
];

const MOCK_SQUADS = [
  { members: [{name: "Aisha Sharma"}, {name: "Alex Rivera"}, {name: "Neha Gupta"}], compatibilityScore: 94 },
  { members: [{name: "Rishi Singh"}, {name: "Sarah Chen"}], compatibilityScore: 91 },
];

export default function HackathonMode() {
  const [hackathonId, setHackathonId] = useState("CU-HACK-2026");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Registration State
  const [showJoin, setShowJoin] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: "", email: "", experienceLevel: "Beginner", campus: "", state: "", skills: ""
  });

  // Data State
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [suggestedTeams, setSuggestedTeams] = useState([]);

  // Presenter Demo State
  const [demoUser1, setDemoUser1] = useState(null);
  const [demoUser2, setDemoUser2] = useState(null);
  const [demoResult, setDemoResult] = useState(null);
  const [calculatingDemo, setCalculatingDemo] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        getHackathonMatches(hackathonId),
        getSuggestedTeams(hackathonId)
      ]);
      setLeaderboard(matchesRes.data?.topPairs || []);
      setTotalParticipants(matchesRes.data?.totalParticipants || 0);
      setSuggestedTeams(teamsRes.data?.teams || []);
      
      // Auto-assign demo users if available
      if (matchesRes.data?.totalParticipants >= 2 && !demoUser1 && !demoUser2) {
         setDemoUser1(matchesRes.data.topPairs[0].user1);
         setDemoUser2(matchesRes.data.topPairs[0].user2);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [hackathonId]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...joinForm,
        hackathonId,
        email: joinForm.email || `${joinForm.name.replace(/\s+/g,'').toLowerCase()}@hackathon.local`,
        skills: joinForm.skills.split(",").map(s => ({ name: s.trim(), level: joinForm.experienceLevel }))
      };
      const res = await joinHackathon(payload);
      // Auto login locally for demo
      localStorage.setItem("devmatch_token", res.data.token);
      setShowJoin(false);
      setJoinForm({ name: "", email: "", experienceLevel: "Beginner", campus: "", state: "", skills: "" });
      refreshData();
    } catch(err) {
      alert("Failed to join hackathon.");
    } finally {
      setLoading(false);
    }
  };

  const runDemoComparison = async () => {
    if (!demoUser1 || !demoUser2) return;
    setCalculatingDemo(true);
    try {
      const res = await demoCompare({ user1Skills: demoUser1.skills, user2Skills: demoUser2.skills });
      setDemoResult(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setCalculatingDemo(false);
    }
  };

  const isMock = totalParticipants === 0;
  const displayLeaderboard = isMock ? MOCK_LEADERBOARD : leaderboard;
  const displayTeams = isMock ? MOCK_SQUADS : suggestedTeams;

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      
      {/* Top Console */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6 p-8 linear-card rounded-3xl relative overflow-hidden shadow-2xl shadow-[#f9ae9b]/5">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#f9ae9b]/10 blur-[100px] rounded-full"></div>
        <div>
          <h1 className={`${playfair.className} text-4xl font-bold text-[#222] mb-3 tracking-tight`}>
            Local Hackathon <span className="text-[#f9ae9b]">Control Center</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold bg-[#fbfbfb] text-[#888] px-3 py-1.5 rounded-lg border border-[#eee] uppercase tracking-widest shadow-sm">
              Event ID: {hackathonId}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm shadow-emerald-500/5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Live Pool ({totalParticipants})</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 relative z-10">
           <button onClick={refreshData} disabled={refreshing} className="btn-secondary !py-3 !px-6 text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
             {refreshing ? "..." : "🔄 Refresh Data"}
           </button>
           <button onClick={() => setShowJoin(true)} className="btn-primary flex items-center gap-2 shadow-xl shadow-[#f9ae9b]/30 active:scale-95">
             <span className="text-xl leading-none">+</span> Join Current Pool
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 mb-10">
        
        {/* LEADERBOARD (Compatibility Matrix) */}
        <div className="linear-card p-8 flex flex-col h-[600px] relative">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xs font-bold text-[#f9ae9b] uppercase tracking-[0.2em]">Compatibility Leaderboard</h2>
             <div className="h-[1px] flex-grow mx-4 bg-[#f0e6e4]/40"></div>
             <span className="text-[10px] font-bold text-gray-400">RANKED BY COSINE</span>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {displayLeaderboard.length > 0 ? displayLeaderboard.map((pair, idx) => (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.05}} key={idx} className={`bg-white border border-[#f0e6e4]/60 p-5 rounded-2xl flex items-center justify-between transition-all group ${isMock ? 'opacity-70' : 'hover:border-[#f9ae9b]/40 hover:shadow-lg hover:shadow-[#f9ae9b]/5'}`}>
                   <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${idx < 3 && !isMock ? 'bg-[#fcefec] text-[#f9ae9b] border border-[#f9ae9b]/20 shadow-inner' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                         {idx+1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-bold text-[15px] ${isMock ? 'text-gray-500' : 'text-[#222]'}`}>{pair.user1.name}</p>
                          <span className={`${isMock ? 'text-gray-300' : 'text-[#f9ae9b] opacity-40'} text-xs`}>🤝</span>
                          <p className={`font-bold text-[15px] ${isMock ? 'text-gray-500' : 'text-[#222]'}`}>{pair.user2.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isMock ? 'text-gray-300' : 'text-gray-400'}`}>High Synergy Affinity</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                          <span className="text-[10px] text-gray-400 italic">Matched {pair.user1.skills.length + pair.user2.skills.length} vectors</span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold font-display ${isMock ? 'text-gray-400' : 'text-[#f9ae9b]'}`}>{pair.score}</span>
                        <span className={`text-xs font-bold ${isMock ? 'text-gray-300' : 'text-[#f9ae9b]/60'}`}>%</span>
                     </div>
                     <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${pair.score}%`}} className={`h-full ${isMock ? 'bg-gray-300' : 'bg-[#f9ae9b]'}`}></motion.div>
                     </div>
                   </div>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <span className="text-4xl opacity-30">📊</span>
                  </div>
                  <p className="text-sm font-medium">Matrix awaiting participant expansion</p>
                  <p className="text-[10px] mt-1 font-medium italic">Requires at least 2 participants for synergy</p>
                </div>
              )}
           </div>
        </div>

        {/* AI TEAM SUGGESTIONS */}
        <div className="linear-card p-8 flex flex-col h-[600px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xs font-bold text-[#f9ae9b] uppercase tracking-[0.2em]">AI Suggested Teams</h2>
             <div className="h-[1px] flex-grow mx-4 bg-[#f0e6e4]/40"></div>
             <span className="text-[10px] font-bold text-gray-400">GREEDY CLUSTERING</span>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 gap-5">
              {displayTeams.length > 0 ? displayTeams.map((team, idx) => (
                <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} transition={{delay: idx*0.1}} key={idx} className={`border p-6 rounded-2xl shadow-sm transition-shadow ${isMock ? 'bg-white border-gray-100 opacity-70' : 'bg-gradient-to-br from-[#fcefec] to-white border-[#f9ae9b]/15 hover:shadow-md'}`}>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className={`${playfair.className} text-xl font-bold ${isMock ? 'text-gray-500' : 'text-[#222]'}`}>Squad Ensemble-{idx+1}</h3>
                    <div className="flex items-center gap-2">
                       <div className={`px-3 py-1.5 rounded-full border shadow-sm ${isMock ? 'bg-gray-50 border-gray-100' : 'bg-white border-[#f9ae9b]/20'}`}>
                          <span className={`text-[11px] font-bold tracking-widest ${isMock ? 'text-gray-400' : 'text-[#f9ae9b]'}`}>{team.compatibilityScore}% SYNC</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {team.members.map((m, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border border-gray-100 shadow-sm ${isMock ? 'bg-gray-50' : 'bg-white hover:border-[#f9ae9b]/30 transition-colors group'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border ${isMock ? 'bg-white text-gray-400 border-gray-200' : 'bg-gray-50 text-[#f9ae9b] border-gray-100 group-hover:bg-[#f9ae9b] group-hover:text-white transition-colors'}`}>{m.name.charAt(0)}</div>
                        <span className={`text-[13px] font-medium ${isMock ? 'text-gray-500' : 'text-[#444]'}`}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <span className="text-4xl opacity-30">🤖</span>
                  </div>
                  <p className="text-sm font-medium">Pool expansion in progress...</p>
                  <p className="text-[10px] mt-1 font-medium italic">Ensemble clustering requires 3+ participants</p>
                </div>
              )}
           </div>
        </div>

      </div>

      {/* Live Presenter Demo Module */}
      <div className="max-w-7xl mx-auto linear-card p-10 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
           </svg>
        </div>

        <div className="flex items-center gap-6 mb-10">
           <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-xl shadow-[#f9ae9b]/20">
              ⚡
           </div>
           <div>
              <h2 className={`${playfair.className} text-3xl font-bold text-[#222]`}>Live AI Engine Showcase</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">Real-time vector space computation and cosine similarity visualized.</p>
           </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-end mb-12">
          <div>
             <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2 uppercase pl-1">Participant A</label>
             <select 
               className="input-light w-full border-[#eee]"
               value={demoUser1?._id || ""}
               onChange={(e) => {
                 const u = leaderboard.flatMap(p => [p.user1, p.user2]).find(u => u._id === e.target.value);
                 if(u) setDemoUser1(u);
               }}
             >
               <option value="">Select participant...</option>
               {Array.from(new Set(leaderboard.flatMap(p => [p.user1, p.user2]).map(u => JSON.stringify(u)))).map(u => JSON.parse(u)).map((user) => (
                 <option key={`${user._id}_1`} value={user._id}>{user.name}</option>
               ))}
             </select>
          </div>
          <div>
             <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2 uppercase pl-1">Participant B</label>
             <select 
               className="input-light w-full border-[#eee]"
               value={demoUser2?._id || ""}
               onChange={(e) => {
                 const u = leaderboard.flatMap(p => [p.user1, p.user2]).find(u => u._id === e.target.value);
                 if(u) setDemoUser2(u);
               }}
             >
               <option value="">Select participant...</option>
               {Array.from(new Set(leaderboard.flatMap(p => [p.user1, p.user2]).map(u => JSON.stringify(u)))).map(u => JSON.parse(u)).map((user) => (
                 <option key={`${user._id}_2`} value={user._id}>{user.name}</option>
               ))}
             </select>
          </div>
          <div>
            <button 
              onClick={runDemoComparison} 
              disabled={!demoUser1 || !demoUser2 || calculatingDemo}
              className="w-full btn-primary !py-3.5 !px-4 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {calculatingDemo ? "Computing Hyperdimension..." : "Execute Vector Analysis"}
            </button>
          </div>
        </div>

        {demoResult && (
          <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 bg-[#fbfbfb] border border-gray-100 rounded-[2rem] overflow-hidden p-8 shadow-inner relative">
             
             <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-[#f9ae9b]/10 flex items-center justify-center text-[#f9ae9b] text-xs font-bold font-mono">A</div>
                  <h3 className="font-bold text-[#444] text-[15px]">{demoUser1?.name} Vector</h3>
               </div>
               {Object.entries(demoResult.vector1).length > 0 ? (
                 <ul className="space-y-2">
                   {Object.entries(demoResult.vector1).map(([skill, val]) => (
                     <li key={skill} className="flex justify-between text-xs font-medium">
                       <span className="text-[#f9ae9b]">{skill}</span>
                       <span className="text-gray-400 font-mono tracking-tighter">{val.toFixed(4)}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-xs text-gray-300 italic">EMPTY_SET [0,0,0]</p>
               )}
             </div>

             <div className="relative z-10 flex flex-col items-center justify-center border-x border-gray-100 px-6 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-6">Synergy Matrix Output</p>
                <div className="w-36 h-36 rounded-full border-[8px] border-white shadow-2xl shadow-[#f9ae9b]/20 flex items-center justify-center mb-6 bg-gradient-secondary relative">
                  <div className="absolute inset-0 rounded-full border-2 border-[#f9ae9b]/10 animate-pulse"></div>
                  <span className={`${playfair.className} text-[44px] font-bold text-[#f9ae9b]`}>{demoResult.matchScore}</span>
                  <span className="text-xs font-bold text-[#f9ae9b] mt-4 ml-1">%</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono tracking-tighter text-center uppercase opacity-60">Formula: (A · B) / (||A|| ||B||)</p>
             </div>

             <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-[#fcae91]/10 flex items-center justify-center text-[#fcae91] text-xs font-bold font-mono">B</div>
                  <h3 className="font-bold text-[#444] text-[15px]">{demoUser2?.name} Vector</h3>
               </div>
               {Object.entries(demoResult.vector2).length > 0 ? (
                 <ul className="space-y-2">
                   {Object.entries(demoResult.vector2).map(([skill, val]) => (
                     <li key={skill} className="flex justify-between text-xs font-medium">
                       <span className="text-[#fcae91]">{skill}</span>
                       <span className="text-gray-400 font-mono tracking-tighter">{val.toFixed(4)}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-xs text-gray-300 italic">EMPTY_SET [0,0,0]</p>
               )}
             </div>
          </motion.div>
        )}
      </div>

      {/* JOIn Form Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-md flex items-center justify-center p-6">
            <motion.form 
              onSubmit={handleJoin} 
              initial={{scale:0.95, y:20}} animate={{scale:1, y:0}}
              className="glass-card w-full max-w-md shadow-2xl shadow-black/10 overflow-hidden"
            >
              <div className="p-8 border-b border-[#f0e6e4]/60 flex justify-between items-center bg-[#fefcfb]">
                <div>
                  <h3 className={`${playfair.className} text-3xl font-bold text-[#222]`}>Join Current Pool</h3>
                  <p className="text-xs text-[#f9ae9b] font-bold uppercase tracking-widest mt-2">Immediate Access: {hackathonId}</p>
                </div>
                <button type="button" onClick={() => setShowJoin(false)} className="text-gray-300 hover:text-[#f9ae9b] transition-colors p-2 -mr-4 -mt-10">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="18" y1="6" x2="6" y2="18"></line>
                     <line x1="6" y1="6" x2="18" y2="18"></line>
                   </svg>
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Full Name</label>
                   <input required type="text" className="input-light w-full" placeholder="Alex Rivera" value={joinForm.name} onChange={e=>setJoinForm({...joinForm, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Experience</label>
                     <select className="input-light w-full" value={joinForm.experienceLevel} onChange={e=>setJoinForm({...joinForm, experienceLevel: e.target.value})}>
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">State Code</label>
                     <input required type="text" className="input-light w-full" placeholder="CA" value={joinForm.state} onChange={e=>setJoinForm({...joinForm, state: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Current College</label>
                   <input type="text" className="input-light w-full" placeholder="Stanford University" value={joinForm.campus} onChange={e=>setJoinForm({...joinForm, campus: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Tech Stack (comma separated)</label>
                   <input required type="text" className="input-light w-full" placeholder="React, Node, MongoDB" value={joinForm.skills} onChange={e=>setJoinForm({...joinForm, skills: e.target.value})} />
                 </div>
              </div>
              <div className="p-8 bg-[#fefcfb] border-t border-[#f0e6e4]/60">
                 <button type="submit" disabled={loading} className="w-full btn-primary !py-4 shadow-xl active:scale-95">
                   {loading ? "Authenticating Entry..." : "Submit to Vector Space"}
                 </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
