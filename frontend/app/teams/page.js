"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { getTeams, createTeam, sendJoinRequest } from "../../lib/api";

const playfair = Playfair_Display({ subsets: ["latin"] });

const MOCK_TEAMS = [
  {
    _id: "t1", name: "AI Innovators", hackathonTrack: "Artificial Intelligence", maxSize: 4, members: [{}, {}],
    description: "Building an AI-powered code reviewer for the upcoming national hackathon.",
    requiredSkills: ["Python", "React", "Machine Learning"], minExperienceLevel: "Intermediate"
  },
  {
    _id: "t2", name: "Web3 Wizards", hackathonTrack: "Blockchain/Web3", maxSize: 3, members: [{}],
    description: "Creating a decentralized platform for open-source project funding.",
    requiredSkills: ["Solidity", "React", "Node.js"], minExperienceLevel: "Advanced"
  },
  {
    _id: "t3", name: "Frontend Frontiers", hackathonTrack: "Open Innovation", maxSize: 5, members: [{}, {}, {}],
    description: "Aiming to build the most accessible and beautiful UI framework in the hackathon.",
    requiredSkills: ["Figma", "Tailwind", "Next.js"], minExperienceLevel: "Beginner"
  }
];

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    name: "", hackathonTrack: "", maxSize: 4, requiredSkills: "", minExperienceLevel: "Beginner", description: "",
  });
  const [creating, setCreating] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await getTeams();
      setTeams(res.data || []);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createTeam({
        ...createForm,
        requiredSkills: createForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowModal(false);
      setCreateForm({ name: "", hackathonTrack: "", maxSize: 4, requiredSkills: "", minExperienceLevel: "Beginner", description: "" });
      fetchTeams();
    } catch (err) {
      alert("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (teamId) => {
    setJoiningTeam(teamId);
    try {
      await sendJoinRequest({ teamId, message: "I'd love to join your team!" });
      alert("Request sent successfully!");
    } catch (err) {
      alert("Failed to send request.");
    } finally {
      setJoiningTeam(null);
    }
  };

  const displayTeams = teams.length > 0 ? teams : MOCK_TEAMS;
  const isMock = teams.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-gray-50 pb-8">
        <div>
          <h1 className={`${playfair.className} text-4xl font-bold text-[#222] mb-3`}>Squad Assembler</h1>
          <p className="text-gray-400 text-[15px] font-medium">Discover technical squads recruiting for your core vector nodes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn-primary !py-4 !px-8 shadow-xl shadow-[#f9ae9b]/30 hover:-translate-y-1 transition-all active:scale-95"
        >
          + Launch New Squad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div></div>
      ) : displayTeams.length > 0 ? (
        <>
          {isMock && (
            <div className="mb-10 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg">💡</span>
                  <p className="text-[11px] text-rose-500 font-bold uppercase tracking-widest leading-relaxed">
                    Visualizing Demo Squads: There are no active squads yet. Here is a preview of the recruitment interface.
                  </p>
                </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {displayTeams.map((team, i) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white border border-[#f0e6e4]/60 rounded-3xl flex flex-col group overflow-hidden shadow-xl shadow-[#f9ae9b]/5 hover:border-[#f9ae9b]/40 transition-all ${isMock ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className={`h-1.5 w-full bg-gradient-secondary opacity-30 group-hover:opacity-100 transition-opacity ${isMock ? 'grayscale' : ''}`}></div>
                
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className={`${playfair.className} text-2xl font-bold text-[#222] truncate pr-4 ${isMock ? 'text-gray-500' : ''}`}>{team.name}</h3>
                    <div className="flex items-center gap-2 bg-[#fbfbfb] border border-[#eee] px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-400 shrink-0 shadow-sm">
                      <span className={isMock ? 'text-gray-400' : 'text-[#f9ae9b]'}>👤 {team.members?.length || 1}</span>
                      <span className="opacity-30">/</span>
                      <span>{team.maxSize}</span>
                    </div>
                  </div>

                  {team.hackathonTrack && (
                    <div className="mb-6">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border uppercase tracking-widest ${isMock ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-[#fff2ee] text-[#f9ae9b] border-[#f9ae9b]/10'}`}>
                        🎯 {team.hackathonTrack}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-[14px] text-gray-400 mb-8 line-clamp-3 font-medium leading-relaxed">
                    {team.description || "No vector brief provided for this squad."}
                  </p>

                  <div className="space-y-4 mt-auto">
                    <div>
                      <p className="text-[10px] font-black text-gray-300 mb-3 uppercase tracking-[0.2em]">Required Nodes</p>
                      <div className="flex flex-wrap gap-2">
                        {team.requiredSkills?.map((s, j) => (
                          <span key={j} className="text-[11px] px-3 py-1.5 rounded-xl bg-[#fbfbfb] text-[#666] border border-[#f0e6e4]/60 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] pt-2">
                      <span className="text-gray-300 font-black uppercase tracking-widest">Vector Min:</span>
                      <span className={`font-bold uppercase tracking-widest ${
                        isMock ? 'text-gray-400' :
                        team.minExperienceLevel === 'Expert' ? 'text-[#f9ae9b]' :
                        team.minExperienceLevel === 'Advanced' ? 'text-amber-500' :
                        team.minExperienceLevel === 'Intermediate' ? 'text-emerald-500' :
                        'text-gray-400'
                      }`}>
                        {team.minExperienceLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#fbfbfb]/50 border-t border-[#f0e6e4]/40 flex gap-4">
                  <Link 
                    href={isMock ? '#' : `/chat/${team._id}`} 
                    className={`flex-1 text-center py-3.5 bg-white hover:bg-gray-50 border border-[#f0e6e4] text-[11px] font-bold uppercase tracking-widest text-gray-400 rounded-2xl transition-all shadow-sm ${isMock ? 'cursor-not-allowed opacity-50' : 'active:scale-95'}`}
                  >
                    Briefing
                  </Link>
                  <button
                    onClick={() => handleJoin(team._id)}
                    disabled={joiningTeam === team._id || isMock}
                    className={`flex-1 py-3.5 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all ${isMock ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#f9ae9b] hover:bg-[#fac2b4] shadow-lg shadow-[#f9ae9b]/10 active:scale-95 disabled:opacity-50'}`}
                  >
                    {joiningTeam === team._id ? "..." : (isMock ? "Demo Only" : "Request Sync")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : null}

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-white/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50 p-6"
            >
              <form onSubmit={handleCreate} className="bg-white border border-[#f0e6e4] rounded-[2.5rem] shadow-[0_40px_100px_-15px_rgba(249,174,155,0.2)] flex flex-col max-h-[90vh]">
                <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className={`${playfair.className} text-2xl font-bold text-[#222]`}>Squad Calibration</h3>
                  <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#f9ae9b] transition-colors">✕</button>
                </div>
                
                <div className="p-10 overflow-y-auto custom-scrollbar space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Squad Designation</label>
                    <input required type="text" className="input-light w-full border-[#eee]" value={createForm.name}
                      placeholder="e.g. Neural Nexus Alpha"
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Hackathon Domain</label>
                    <input type="text" className="input-light w-full border-[#eee]" placeholder="e.g. AI/ML, FinTech" value={createForm.hackathonTrack}
                      onChange={(e) => setCreateForm({ ...createForm, hackathonTrack: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Capacity</label>
                      <input type="number" min="2" max="10" className="input-light w-full border-[#eee]" value={createForm.maxSize}
                        onChange={(e) => setCreateForm({ ...createForm, maxSize: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Threshold</label>
                      <select className="input-light w-full border-[#eee] text-xs font-bold" value={createForm.minExperienceLevel}
                        onChange={(e) => setCreateForm({ ...createForm, minExperienceLevel: e.target.value })}>
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Required Nodes (CSV)</label>
                    <input type="text" className="input-light w-full border-[#eee]" placeholder="React, Python, Tensor" value={createForm.requiredSkills}
                      onChange={(e) => setCreateForm({ ...createForm, requiredSkills: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 pl-1">Squad Briefing</label>
                    <textarea className="input-light w-full h-32 resize-none border-[#eee]" value={createForm.description}
                      placeholder="Describe the mission objectives..."
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                  </div>
                </div>

                <div className="p-8 border-t border-gray-50 bg-[#fbfbfb]/50 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#f9ae9b] transition-colors">
                    Abort
                  </button>
                  <button type="submit" disabled={creating} className="btn-primary !py-3.5 !px-10 shadow-xl shadow-[#f9ae9b]/20 active:scale-95 disabled:opacity-50">
                    {creating ? "Launching..." : "Broadcast Squad"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
