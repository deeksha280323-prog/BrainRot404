"use client";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Poppins } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });

const featuresList = [
  { title: "Algorithm Match", subtitle: "Cosine Similarity Connect", price: "Free" },
  { title: "Auto-Teams", subtitle: "Instant Full-Stack Synergy", price: "Free" },
  { title: "Live Swiping", subtitle: "Explore Developers Quickly", price: "Free" },
  { title: "Global Events", subtitle: "Join Top Hackathons", price: "Free" },
  { title: "Verified Skills", subtitle: "Prove your Tech Stack", price: "Free" },
  { title: "WebSockets Chat", subtitle: "Real-time Texting", price: "Free" },
  { title: "Vector Search", subtitle: "Embeddings Computation", price: "Free" },
  { title: "Cloud Storage", subtitle: "Permanent User Records", price: "Free" },
];

export default function LandingPage() {
  return (
    // This absolute wrapper overrides the global dark UI background specifically for this landing page
    <div className={`absolute inset-0 bg-[#fefcfb] text-[#333] z-[100] ${poppins.className} overflow-y-auto overflow-x-hidden min-h-screen`}>
      
      {/* Background Soft Graphics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fff0ea] rounded-bl-full opacity-60 pointer-events-none -z-10"></div>
      
      {/* Navbar Section */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        
        {/* Logo Left */}
        <div className="flex items-center gap-2">
          {/* Flower Vector Graphic */}
          <svg width="40" height="40" viewBox="0 0 50 50" fill="none" className="text-[#f9ae9b]">
            <path d="M25 5C25 5 15 15 15 25C15 35 25 45 25 45C25 45 35 35 35 25C35 15 25 5 25 5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M25 15C25 15 5 15 5 25C5 35 25 35 25 35" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M25 15C25 15 45 15 45 25C45 35 25 35 25 35" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <div className="flex flex-col select-none">
            <span className={`${playfair.className} text-3xl font-bold tracking-tight text-[#222] leading-none`}>DevMatch</span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-gray-400 mt-1">Hackathon Ecosystem</span>
          </div>
        </div>

        {/* Center Links (Hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[#444]">
          <Link href="/" className="hover:text-[#f9ae9b] transition-colors flex items-center gap-1">
            Home <span className="text-[#f9ae9b] text-[10px]">＋</span>
          </Link>
          <Link href="#" className="hover:text-[#f9ae9b] transition-colors">About</Link>
          <Link href="/discover" className="hover:text-[#f9ae9b] transition-colors flex items-center gap-1">
            Matching <span className="text-[#f9ae9b] text-[10px]">＋</span>
          </Link>
          <Link href="#" className="hover:text-[#f9ae9b] transition-colors">Events</Link>
          <Link href="#" className="hover:text-[#f9ae9b] transition-colors">Team</Link>
        </div>

        {/* Right Corner Nav */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-[13px] font-medium text-[#444] hover:text-[#f9ae9b] transition-colors cursor-pointer mr-2">Login</Link>
          <button className="w-12 h-12 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.05)] flex items-center justify-center border border-gray-100 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#222]">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-10 items-center relative z-10">
        
        {/* Left Copy */}
        <div className="max-w-xl pl-4 sm:pl-10">
          
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="flex items-center gap-4 mb-4">
            <svg width="24" height="24" viewBox="0 0 50 50" fill="none" className="text-[#f9ae9b]">
               <path d="M25 5C25 5 15 15 15 25C15 35 25 45 25 45C25 45 35 35 35 25C35 15 25 5 25 5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <div className="h-[2px] w-16 bg-[#f9ae9b] opacity-60"></div>
          </motion.div>

          <motion.h1 
            initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}}
            className={`${playfair.className} text-5xl sm:text-6xl md:text-[76px] font-extrabold text-[#222] leading-[1.05] tracking-tight mb-8`}
          >
            Experience the<br/>
            Best Hackathon<br/>
            <span className="text-[#f9ae9b]">Matches</span>
          </motion.h1>

          <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="text-[#666] font-medium text-[15px] max-w-sm mb-12">
            AI-powered developer matching to build your ultimate squad. Live clustering, vector comparisons, and instant swiping.
          </motion.p>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}}>
             <Link href="/register">
               <button className="bg-white hover:bg-gray-50 pr-8 pl-2 py-2 rounded-full shadow-[0_8px_30px_rgba(249,174,155,0.2)] flex items-center gap-4 font-medium text-[#444] text-sm transition-all hover:-translate-y-1">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ae9b] to-[#fac2b4] flex items-center justify-center text-white shadow-md">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="11" cy="11" r="8"></circle>
                     <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                   </svg>
                 </div>
                 Join Platform
               </button>
             </Link>
          </motion.div>

        </div>

        {/* Right Image */}
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: 0.4, duration: 0.8}} className="relative">
          {/* Subtle Ring decor */}
          <div className="absolute top-0 bottom-0 -left-12 -right-12 rounded-full border border-[#f9ae9b] opacity-20"></div>
          
          <div className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] max-w-full rounded-full overflow-hidden relative shadow-2xl mx-auto">
             <Image 
               src="/hero.png" 
               alt="Developer Matchmaking" 
               fill 
               className="object-cover"
               priority
             />
          </div>
        </motion.div>
      </section>

      {/* Pricing / Features Section */}
      <section className="relative pt-24 pb-32">
        {/* Soft background watermark / gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fefcfb] to-[#fff8f5] -z-10"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#f9ae9b] rounded-full blur-[150px] opacity-[0.05] -z-10 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           
           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="mb-16">
             <h4 className="text-[#f9ae9b] font-medium tracking-[0.2em] uppercase text-xs mb-3">Feature Access</h4>
             <h2 className={`${playfair.className} text-[54px] font-bold text-[#222] leading-none`}>
               Platform <span className="text-[#f9ae9b]">Access</span>
             </h2>
             <p className="text-[#777] max-w-2xl mt-6 text-[15px] leading-relaxed">
               Every developer gets access to our core matching algorithms and team building layers without any subscription required. Experience the purest synergy building today.
             </p>
           </motion.div>

           <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12">
             
             {featuresList.map((feature, i) => (
                <motion.div 
                  initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.1}} 
                  key={i} 
                  className="flex items-center gap-5 group"
                >
                  <div className="w-20 h-20 rounded-[20px] overflow-hidden shrink-0 shadow-sm relative group-hover:shadow-md transition-shadow">
                    <Image src="/tech.png" alt={feature.title} fill className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center translate-y-1">
                    <div className="flex items-end w-full">
                       <span className={`${playfair.className} text-[22px] font-bold text-[#333] whitespace-nowrap`}>{feature.title}</span>
                       <div className="flex-1 border-b-[1.5px] border-[#e8dcd8] mx-4 translate-y-[-8px]"></div>
                       <div className="flex items-center gap-2">
                         <span className="text-gray-400 text-xs font-medium">starting</span>
                         <span className={`${playfair.className} text-2xl font-bold text-[#333]`}>{feature.price}</span>
                       </div>
                    </div>
                    <span className="text-[#888] text-[13px] font-medium -mt-1 block">{feature.subtitle}</span>
                  </div>
                </motion.div>
             ))}

           </div>

        </div>
      </section>

      {/* Floating Action Button (Matches the bottom right arrow from screenshot) */}
      <div className="fixed bottom-10 right-10 z-50">
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="w-12 h-12 rounded-full bg-[#f9ae9b] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>

    </div>
  );
}
