"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { demoCompare } from "../../lib/api";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function DemoPage() {
  const [user1, setUser1] = useState({ name: "Participant A", skills: [] });
  const [user2, setUser2] = useState({ name: "Participant B", skills: [] });
  const [newSkill1, setNewSkill1] = useState({ name: "", level: "Intermediate" });
  const [newSkill2, setNewSkill2] = useState({ name: "", level: "Intermediate" });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addSkill = (userNum) => {
    if (userNum === 1) {
      if (!newSkill1.name.trim()) return;
      if (!user1.skills.find(s => s.name.toLowerCase() === newSkill1.name.toLowerCase())) {
        setUser1({ ...user1, skills: [...user1.skills, newSkill1] });
      }
      setNewSkill1({ name: "", level: "Intermediate" });
    } else {
      if (!newSkill2.name.trim()) return;
      if (!user2.skills.find(s => s.name.toLowerCase() === newSkill2.name.toLowerCase())) {
        setUser2({ ...user2, skills: [...user2.skills, newSkill2] });
      }
      setNewSkill2({ name: "", level: "Intermediate" });
    }
  };

  const clearSkills = () => {
    setUser1({ ...user1, skills: [] });
    setUser2({ ...user2, skills: [] });
    setResult(null);
  };

  const handleCompare = async () => {
    if (user1.skills.length === 0 || user2.skills.length === 0) {
      alert("Please add at least one skill to both participants!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await demoCompare({
        user1Skills: user1.skills,
        user2Skills: user2.skills
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate comparison.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col py-10 px-4 max-w-6xl mx-auto w-full">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-display mb-2">
          Live <span className="text-gradient">Algorithm Demo</span>
        </h1>
        <p className="text-slate-400">Add skills for two participants below and see the Cosine Similarity match score in real time.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        
        {/* Participant A */}
        <div className="glass-card p-6">
          <input 
            className="text-2xl font-bold font-display bg-transparent border-b border-dashed border-slate-600 focus:border-indigo-400 outline-none w-full text-center mb-6 pb-2"
            value={user1.name}
            onChange={(e) => setUser1({...user1, name: e.target.value})}
          />
          
          <div className="flex gap-2 mb-6">
            <input 
              className="input-dark flex-grow" 
              placeholder="E.g. Python, React..."
              value={newSkill1.name}
              onChange={(e) => setNewSkill1({...newSkill1, name: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && addSkill(1)}
            />
            <select 
              className="input-dark"
              value={newSkill1.level}
              onChange={(e) => setNewSkill1({...newSkill1, level: e.target.value})}
            >
              {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => addSkill(1)} className="btn-secondary !px-4">+</button>
          </div>

          <div className="space-y-2 min-h-[150px]">
            {user1.skills.map((s, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-2 rounded-lg skill-${s.level.toLowerCase()}`}>
                <span className="font-semibold">{s.name}</span>
                <span className="text-xs opacity-80">{s.level}</span>
              </div>
            ))}
            {user1.skills.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-sm py-10 border border-dashed border-slate-700 rounded-xl">
                No skills added yet
              </div>
            )}
          </div>
        </div>

        {/* Participant B */}
        <div className="glass-card p-6">
          <input 
            className="text-2xl font-bold font-display bg-transparent border-b border-dashed border-slate-600 focus:border-pink-400 outline-none w-full text-center mb-6 pb-2"
            value={user2.name}
            onChange={(e) => setUser2({...user2, name: e.target.value})}
          />
          
          <div className="flex gap-2 mb-6">
            <input 
              className="input-dark flex-grow" 
              placeholder="E.g. JavaScript, AWS..."
              value={newSkill2.name}
              onChange={(e) => setNewSkill2({...newSkill2, name: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && addSkill(2)}
            />
            <select 
              className="input-dark"
              value={newSkill2.level}
              onChange={(e) => setNewSkill2({...newSkill2, level: e.target.value})}
            >
              {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => addSkill(2)} className="btn-secondary !px-4">+</button>
          </div>

          <div className="space-y-2 min-h-[150px]">
            {user2.skills.map((s, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-2 rounded-lg skill-${s.level.toLowerCase()}`}>
                <span className="font-semibold">{s.name}</span>
                <span className="text-xs opacity-80">{s.level}</span>
              </div>
            ))}
            {user2.skills.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-sm py-10 border border-dashed border-slate-700 rounded-xl">
                No skills added yet
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button onClick={clearSkills} className="btn-secondary !py-4 px-10">Reset Data</button>
        <button onClick={handleCompare} disabled={loading} className="btn-primary !py-4 px-12 text-lg shadow-lg shadow-indigo-500/30">
          {loading ? "Calculating Matrices..." : "Compare Participants →"}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card p-10 max-w-3xl mx-auto w-full text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/20 blur-3xl rounded-full"></div>
            
            <h3 className="text-xl font-bold mb-4 font-display">Cosine Similarity Score</h3>
            
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-2xl font-bold truncate max-w-[150px]">{user1.name}</div>
              <div className="text-6xl font-black text-gradient drop-shadow-lg">{result.matchScore}%</div>
              <div className="text-2xl font-bold truncate max-w-[150px]">{user2.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-700/50 pt-6">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="text-xs text-slate-400 mb-2 font-mono break-words">Vector A:</div>
                <div className="text-sm font-mono text-indigo-300 break-words">
                  {JSON.stringify(result.vector1, null, 2)}
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="text-xs text-slate-400 mb-2 font-mono break-words">Vector B:</div>
                <div className="text-sm font-mono text-pink-300 break-words">
                  {JSON.stringify(result.vector2, null, 2)}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
