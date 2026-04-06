"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "../components/ProfileImageUpload";
import { Playfair_Display } from "next/font/google";
import { getMe, updateProfile } from "../../lib/api";
import { useRightPanel } from "../contexts/RightPanelContext";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function ProfilePage() {
  const router = useRouter();
  const { setPanelData } = useRightPanel();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }
    
    getMe()
      .then((res) => { 
        setUser(res.data); 
        setForm(res.data); 
        setPanelData({ user: res.data });
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router, setPanelData]);

  const handleSave = async () => {
    try {
      const res = await updateProfile(form);
      setUser(res.data);
      setPanelData({ user: res.data });
      setEditing(false);
    } catch (err) {
      alert("Failed to save profile changes.");
    }
  };

  const removeSkill = (idx) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) });
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Top Identity Section */}
      <div className="linear-card p-10 mb-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-2xl shadow-[#f9ae9b]/5">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#f9ae9b]/5 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f9ae9b]/5 blur-[100px] rounded-full"></div>

        <ProfileImageUpload 
          initialImage={user?.profilePicture} 
          onUploadSuccess={(url) => {
            setUser({ ...user, profilePicture: url });
            setForm({ ...form, profilePicture: url });
            setPanelData({ user: { ...user, profilePicture: url } });
          }} 
        />
        
        <div className="flex-grow text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              {editing ? (
                <input type="text" className="input-light text-2xl font-bold border-[#eee] mb-2 px-3 py-1 w-full" value={form.name || ""} onChange={(e) => setForm({...form, name: e.target.value})} />
              ) : (
                <h1 className={`${playfair.className} text-4xl font-bold text-[#222]`}>{user?.name}</h1>
              )}
              <p className="text-xs font-bold text-[#f9ae9b] uppercase tracking-[0.2em] mt-2">{user?.experienceLevel?.overall || "Developer"} Vector</p>
              <p className="text-[14px] text-gray-400 font-medium mt-1">{user?.email}</p>
            </div>
            <button 
              onClick={() => { if (editing) handleSave(); else setEditing(true); }}
              className={`btn-primary !py-3 !px-8 text-xs font-bold uppercase tracking-widest shadow-xl transition-all ${editing ? "shadow-[#f9ae9b]/30" : "bg-[#222] hover:bg-black shadow-black/10"}`}
            >
              {editing ? "Save Identity" : "Modify Profile"}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
             {editing ? (
               <div className="flex items-center gap-2">
                 <span className="text-[#f9ae9b]">🎓</span>
                 <input type="text" className="input-light text-xs px-3 py-1.5 w-48" placeholder="University Name" value={form.campus?.college || ""} onChange={(e) => setForm({...form, campus: { ...form.campus, college: e.target.value }})} />
               </div>
             ) : user?.campus?.college ? (
              <span className="px-5 py-2.5 bg-white border border-[#f0e6e4]/60 rounded-2xl text-[11px] font-bold text-gray-500 flex items-center gap-2 shadow-sm">
                <span className="text-[#f9ae9b]">🎓</span> {user.campus.college}
              </span>
             ) : null}
             <span className="px-5 py-2.5 bg-white border border-[#f0e6e4]/60 rounded-2xl text-[11px] font-bold text-gray-500 flex items-center gap-2 shadow-sm">
                <span className="text-[#f9ae9b]">📍</span> {user?.state || "Remote"}
             </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Core Logic (Left Col) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="linear-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.25em]">Neural Stack Nodes</h2>
              <div className="h-[1px] flex-grow mx-8 bg-[#f0e6e4]/40"></div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {(editing ? form.skills : user?.skills)?.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border bg-[#fbfbfb] shadow-sm transition-all group skill-${s.level.toLowerCase()}`}>
                  <span className="text-[13px] font-bold text-[#444]">{s.name}</span>
                  <div className="w-[1.5px] h-3 bg-[#e8dcd8]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{s.level}</span>
                  
                  {editing && (
                    <button onClick={() => removeSkill(i)} className="ml-2 w-5 h-5 rounded-lg border border-[#eee] bg-white group-hover:border-rose-200 group-hover:text-rose-500 flex items-center justify-center text-[10px] transition-colors">×</button>
                  )}
                </div>
              ))}
              {(editing ? form.skills : user?.skills)?.length === 0 && (
                <p className="text-gray-400 text-sm font-medium italic py-4 pl-4 border-l-2 border-[#f9ae9b]/30">No neural nodes mapped yet. Launch onboarding to recalibrate.</p>
              )}
            </div>

            {editing && (
              <div className="mt-8 pt-6 border-t border-[#f0e6e4]/50 flex flex-wrap items-center gap-3">
                 <input type="text" id="newSkillName" placeholder="New skill (e.g. Docker)" className="input-light text-xs py-2 px-3 w-40" />
                 <select id="newSkillLevel" className="input-light text-xs py-2 px-3 w-32">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                 </select>
                 <button type="button" onClick={() => {
                    const n = document.getElementById('newSkillName').value;
                    const l = document.getElementById('newSkillLevel').value;
                    if(n) {
                      setForm({...form, skills: [...(form.skills||[]), {name: n, level: l}]});
                      document.getElementById('newSkillName').value = '';
                    }
                 }} className="btn-secondary !py-2 !px-4 text-[10px] font-bold uppercase tracking-widest shadow-sm">Add Node</button>
              </div>
            )}
          </div>
          
          {/* Bio Block */}
          <div className="linear-card p-10">
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.25em]">Developer Brief</h2>
              <div className="h-[1px] flex-grow mx-8 bg-[#f0e6e4]/40"></div>
            </div>
            {editing ? (
              <textarea
                className="input-light w-full h-48 resize-none border-[#eee]"
                value={form.bio || ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Synchronize your professional biography..."
              />
            ) : (
              <p className="text-gray-500 text-[15px] leading-relaxed font-medium pl-6 border-l-2 border-[#f9ae9b]/30">{user?.bio || "No biography provided in vector space."}</p>
            )}
          </div>

          <div className="linear-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.25em]">Region Context</h2>
              <div className="h-[1px] flex-grow mx-8 bg-[#f0e6e4]/40"></div>
            </div>
            {editing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 pl-1 tracking-widest">State / Region</label>
                  <input type="text" className="input-light w-full text-sm border-[#eee]" value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 pl-1 tracking-widest">Country</label>
                  <input type="text" className="input-light w-full text-sm border-[#eee]" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#fbfbfb] p-6 rounded-2xl border border-[#eee] shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Geo Tag</p>
                  <p className="text-sm font-bold text-[#222]">
                    {user?.state || user?.country ? `${user?.state || ''}${user?.state && user?.country ? ', ' : ''}${user?.country || ''}` : "Coordinate Unknown"}
                  </p>
                </div>
                <div className="bg-[#fbfbfb] p-6 rounded-2xl border border-[#eee] shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Local Timezone</p>
                  <p className="text-sm font-bold text-[#222]">{user?.timezone || "UTC Standard"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="linear-card p-8 bg-gradient-to-br from-[#f9ae9b]/5 to-transparent shadow-xl">
             <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.25em] mb-6">Achievements</h2>
             <div className="space-y-4">
                <div className="p-4 bg-white border border-[#f0e6e4]/60 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-[#f9ae9b]/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#f9ae9b]/10 flex items-center justify-center text-[#f9ae9b] font-bold text-xs">AI</div>
                  <div>
                    <p className="text-xs font-bold text-[#222]">Neural Specialist</p>
                    <p className="text-[9px] font-bold text-[#f9ae9b]/60 uppercase tracking-widest">Endorsed</p>
                  </div>
                </div>
                <div className="p-4 border-2 border-dashed border-[#f0e6e4] rounded-2xl text-center flex flex-col items-center justify-center py-8 opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
                  <span className="text-2xl mb-2">🏅</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mint Achievement</p>
                </div>
             </div>
          </div>
          
          <div className="linear-card p-8">
            <h2 className="text-[11px] font-bold text-[#f9ae9b] uppercase tracking-[0.25em] mb-6">Hackathon Path</h2>
            <div className="text-center py-10 grayscale opacity-40">
              <span className="text-4xl block mb-4">🛸</span>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">Path Awaiting Initialization</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
