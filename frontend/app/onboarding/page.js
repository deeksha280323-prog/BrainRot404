"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { getMe, updateProfile } from "../../lib/api";
import ProfileImageUpload from "../components/ProfileImageUpload";

const playfair = Playfair_Display({ subsets: ["latin"] });

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "Node.js", "Python", "JavaScript", "TypeScript",
  "MongoDB", "SQL", "Firebase", "Flutter", "Swift", "Java", "C++",
  "Machine Learning", "AI", "Docker", "AWS", "Figma", "UI/UX",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: "",
    campus: { college: "", city: "", region: "", department: "", graduationYear: 2025 },
    state: "", country: "", timezone: "",
    experienceLevel: { overall: "Beginner", yearsOfCoding: 0 },
    skills: [],
    availabilityHours: 10,
  });
  
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if already onboarded
    const fetchUser = async () => {
      try {
        const res = await getMe();
        if (res.data.onboardingCompleted) {
          router.push("/dashboard");
        }
      } catch (err) {
        // Not logged in or error
      }
    };
    fetchUser();
  }, [router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const submitOnboarding = async () => {
    setSubmitting(true);
    try {
      await updateProfile({ ...formData, onboardingCompleted: true });
      setStep(5);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save profiling data: " + (err?.response?.data?.message || err?.message || JSON.stringify(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    if (formData.skills.find((s) => s.name.toLowerCase() === newSkill.name.toLowerCase())) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, { ...newSkill, verified: false }],
    });
    setNewSkill({ name: "", level: "Intermediate" });
  };

  const removeSkill = (idx) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== idx),
    });
  };

  // Step renderer
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      
      {/* Tracker */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex justify-between items-center relative z-10 px-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[13px] font-bold transition-all duration-500 ${
                step >= num 
                ? "bg-[#f9ae9b] text-white shadow-xl shadow-[#f9ae9b]/30" 
                : "bg-white text-gray-300 border border-[#eee]"
              }`}>
                {step > num ? "✓" : num}
              </div>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${step >= num ? "text-[#f9ae9b]" : "text-gray-400"}`}>
                {num === 1 && "Profile"}
                {num === 2 && "Campus"}
                {num === 3 && "Level"}
                {num === 4 && "Stack"}
              </span>
            </div>
          ))}
          {/* Progress Line */}
          <div className="absolute top-5 left-10 right-10 h-[2px] bg-gray-100 -z-10">
            <motion.div 
              className="h-full bg-[#f9ae9b]" 
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg linear-card overflow-hidden shadow-[0_20px_60px_-15px_rgba(249,174,155,0.15)] border-[#f0e6e4]/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center border-b border-gray-50 pb-8">
                  <ProfileImageUpload 
                    initialImage={formData.profilePicture} 
                    onUploadSuccess={(url) => setFormData({ ...formData, profilePicture: url })} 
                  />
                  <div className="flex-grow text-center md:text-left">
                    <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-3`}>Identity Graph</h2>
                    <p className="text-gray-400 text-[14px]">Update your public-facing vector identity.</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Professional Bio</label>
                  <textarea
                    className="input-light w-full h-36 resize-none border-[#eee]"
                    placeholder="E.g. Full-stack developer with 3 years experience in fintech..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between pl-1">
                    Hackathon Availability <span className="text-[#f9ae9b]">{formData.availabilityHours} hrs/week</span>
                  </label>
                  <input
                    type="range"
                    min="5" max="60" step="5"
                    className="w-full accent-[#f9ae9b] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    value={formData.availabilityHours}
                    onChange={(e) => setFormData({ ...formData, availabilityHours: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Campus */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-3`}>Academic Center</h2>
                  <p className="text-gray-400 text-[14px]">University peers get a synergy bonus in the algorithm.</p>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">University</label>
                  <input
                    type="text"
                    className="input-light w-full border-[#eee]"
                    placeholder="e.g. Stanford University"
                    value={formData.campus.college}
                    onChange={(e) => setFormData({ ...formData, campus: { ...formData.campus, college: e.target.value } })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">City</label>
                    <input
                      type="text"
                      className="input-light w-full border-[#eee]"
                      placeholder="e.g. Palo Alto"
                      value={formData.campus.city}
                      onChange={(e) => setFormData({ ...formData, campus: { ...formData.campus, city: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">State</label>
                    <input
                      type="text"
                      className="input-light w-full border-[#eee]"
                      placeholder="e.g. CA"
                      value={formData.campus.region}
                      onChange={(e) => setFormData({ ...formData, campus: { ...formData.campus, region: e.target.value } })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">Department</label>
                  <input
                    type="text"
                    className="input-light w-full border-[#eee]"
                    placeholder="e.g. Computer Science"
                    value={formData.campus.department}
                    onChange={(e) => setFormData({ ...formData, campus: { ...formData.campus, department: e.target.value } })}
                  />
                </div>
                <div className="pt-6 mt-2 border-t border-gray-50 flex items-center gap-4">
                  <div className="flex-grow">
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">Timezone</label>
                    <input type="text" className="input-light w-full border-[#eee]" placeholder="e.g. IST, PST" value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Experience */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-3`}>Maturity Level</h2>
                  <p className="text-gray-400 text-[14px]">This calibrates your role in team clustering.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFormData({ ...formData, experienceLevel: { ...formData.experienceLevel, overall: lvl } })}
                      className={`p-5 rounded-2xl border text-[13px] font-bold transition-all ${
                        formData.experienceLevel.overall === lvl
                          ? "border-[#f9ae9b] bg-[#f9ae9b]/5 text-[#f9ae9b] shadow-[0_8px_20px_-8px_rgba(249,174,155,0.3)]"
                          : "border-[#eee] bg-white text-gray-400 hover:border-[#f9ae9b]/30 hover:bg-gray-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex justify-between pl-1">
                    Practical Coding Experience <span className="text-[#f9ae9b]">{formData.experienceLevel.yearsOfCoding} years</span>
                  </label>
                  <input
                    type="range"
                    min="0" max="15" step="1"
                    className="w-full accent-[#f9ae9b] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    value={formData.experienceLevel.yearsOfCoding}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: { ...formData.experienceLevel, yearsOfCoding: parseInt(e.target.value) } })}
                  />
                </div>
              </div>
            )}            {/* STEP 4: Skills */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className={`${playfair.className} text-3xl font-bold text-[#222] mb-3`}>Technical Stack</h2>
                  <p className="text-gray-400 text-[14px]">Vectors will be computed based on these inputs.</p>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input-light flex-grow border-[#eee]"
                    placeholder="Add tool..."
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  />
                  <button onClick={addSkill} className="btn-secondary !py-2 !px-5 text-xl font-bold">+</button>
                </div>

                <div className="flex flex-wrap gap-2.5 min-h-[120px] p-5 bg-[#fbfbfb] rounded-2xl border border-dashed border-[#eee]">
                  {formData.skills.map((s, i) => (
                    <span key={i} className={`text-[11px] pl-3 pr-2 py-1.5 rounded-xl font-bold flex items-center gap-2 border shadow-sm skill-${s.level.toLowerCase()}`}>
                      {s.name}
                      <button onClick={() => removeSkill(i)} className="w-5 h-5 rounded-full hover:bg-black/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-all">×</button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-gray-300 text-xs italic m-auto">Vector space empty. Add skills to begin.</span>
                  )}
                </div>

                <div>
                   <p className="text-[10px] font-bold text-gray-400 mb-3 tracking-[0.2em] uppercase pl-1">Suggested for you</p>
                   <div className="flex flex-wrap gap-2">
                     {SKILL_SUGGESTIONS
                       .filter(s => !formData.skills.find(fs => fs.name.toLowerCase() === s.toLowerCase()))
                       .slice(0, 6)
                       .map(s => (
                         <button
                           key={s}
                           onClick={() => setNewSkill({ ...newSkill, name: s })}
                           className="text-[10px] px-3 py-1.5 rounded-lg bg-white border border-[#eee] text-[#666] font-bold hover:border-[#f9ae9b] hover:text-[#f9ae9b] transition-all"
                         >
                           + {s}
                         </button>
                     ))}
                   </div>
                </div>
              </div>
            )}
            {/* STEP 5: Success */}
            {step === 5 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                 <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                    className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-500/20"
                 >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </motion.div>
                 <div>
                   <h2 className={`${playfair.className} text-4xl font-bold text-[#222] mb-3`}>Neural Link Established</h2>
                   <p className="text-gray-400 text-sm font-medium">Your vectors have been successfully configured.<br/>Initializing dashboard...</p>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        {step < 5 && (
          <div className="p-8 bg-[#fefcfb] border-t border-[#f0e6e4]/40 flex justify-between items-center">
            <button
              onClick={handlePrev}
              className={`text-xs font-bold text-gray-300 hover:text-[#f9ae9b] uppercase tracking-widest transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              ← Previous
            </button>
            
            {step < 4 ? (
              <button onClick={handleNext} className="btn-primary !py-3 !px-10 text-sm shadow-xl shadow-[#f9ae9b]/25">
                Next Step
              </button>
            ) : (
              <button 
                onClick={submitOnboarding}
                disabled={submitting} 
                className="btn-primary !py-3 !px-10 text-sm shadow-xl shadow-[#f9ae9b]/35 disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Complete Profile 🚀"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
