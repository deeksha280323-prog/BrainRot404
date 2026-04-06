"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { getTeamById } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId;
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("devmatch_user") || "{}")
    : {};

  useEffect(() => {
    const token = localStorage.getItem("devmatch_token");
    if (!token) { router.push("/login"); return; }

    getTeamById(teamId)
      .then((res) => setTeam(res.data))
      .catch(() => router.push("/teams"))
      .finally(() => setLoading(false));

    // Load historic messages
    const fetchHistory = async () => {
      const { data } = await supabase.from('messages').select('*, profiles(name)').eq('team_id', teamId).order('created_at', { ascending: true });
      if (data) {
        setMessages(data.map(m => ({
          sender: m.sender_id,
          senderName: m.profiles?.name || 'Operative',
          content: m.content,
          timestamp: m.created_at
        })));
      }
    };
    fetchHistory();

    // Supabase Channel Setup
    const channel = supabase.channel(`team_${teamId}`);

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `team_id=eq.${teamId}` }, async (payload) => {
        const newMsg = payload.new;
        if (newMsg.sender_id !== currentUser._id) {
          const { data: profile } = await supabase.from('profiles').select('name').eq('id', newMsg.sender_id).single();
          setMessages((prev) => [...prev, {
            sender: newMsg.sender_id,
            senderName: profile?.name || "Operative",
            content: newMsg.content,
            timestamp: newMsg.created_at
          }]);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingUsers = [];
        for (const key in state) {
          if (state[key][0]?.isTyping && state[key][0]?.userId !== currentUser._id) {
            typingUsers.push(state[key][0].userId);
          }
        }
        setTyping(typingUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: currentUser._id, isTyping: false });
        }
      });

    setSocket(channel);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msgContent = newMessage;
    setNewMessage("");

    if (socket) await socket.track({ userId: currentUser._id, isTyping: false });

    const { data: dbMsg } = await supabase.from('messages').insert({
       team_id: teamId,
       sender_id: currentUser._id,
       content: msgContent
    }).select().single();

    setMessages((prev) => [...prev, {
       sender: currentUser._id,
       senderName: currentUser.name,
       content: msgContent,
       timestamp: dbMsg?.created_at || new Date().toISOString()
    }]);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.track({ userId: currentUser._id, isTyping: e.target.value.length > 0 });
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="w-10 h-10 border-2 border-[#f9ae9b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex-grow flex flex-col h-[calc(100vh-6rem)]">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#f0e6e4]/60 p-6 mb-6 flex items-center justify-between flex-shrink-0 rounded-[2rem] shadow-xl shadow-[#f9ae9b]/5"
      >
        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/teams")} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#f9ae9b] transition-colors">
            ← 
          </button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center text-[#f9ae9b] font-bold text-xl shadow-inner border border-[#f9ae9b]/10">
            {team?.name?.charAt(0) || "T"}
          </div>
          <div>
            <h2 className={`${playfair.className} text-xl font-bold text-[#222]`}>{team?.name || "Squad Briefing"}</h2>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">
              {team?.members?.length || 0} Operatives
              {team?.hackathonTrack ? ` · ${team.hackathonTrack}` : ""}
            </p>
          </div>
        </div>
        <div className="flex -space-x-3">
          {team?.members?.slice(0, 4).map((m, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-md overflow-hidden bg-gradient-secondary text-[#f9ae9b] text-[10px] font-black">
              {m.name?.charAt(0) || "?"}
            </div>
          ))}
          {team?.members?.length > 4 && (
            <div className="w-10 h-10 rounded-full bg-[#fbfbfb] border-2 border-white flex items-center justify-center shadow-md text-gray-400 text-[10px] font-black">
              +{team.members.length - 4}
            </div>
          )}
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="bg-white border border-[#f0e6e4]/60 flex-grow overflow-y-auto p-8 mb-6 space-y-6 rounded-[2.5rem] shadow-xl shadow-[#f9ae9b]/5 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-xs">
              <span className="text-5xl block mb-6 grayscale opacity-20">📡</span>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Secure Channel Established</p>
              <p className="text-sm text-gray-300">Transmit your first briefing to the neural squad operatives.</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => {
            const isMe = msg.sender === currentUser._id;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                  {!isMe && (
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 block pl-2">{msg.senderName}</span>
                  )}
                  <div
                    className={`px-6 py-4 rounded-3xl text-[14px] font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-[#f9ae9b] text-white rounded-br-lg"
                        : "bg-[#fbfbfb] text-[#555] border border-[#f0e6e4]/60 rounded-bl-lg"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-gray-300 mt-2 block ${isMe ? "text-right pr-2" : "pl-2"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing.length > 0 && (
          <div className="flex items-center gap-3 text-[10px] text-gray-300 font-black uppercase tracking-widest pl-2">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#f9ae9b] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-[#f9ae9b] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-[#f9ae9b] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
            Operative is typing
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="flex gap-4 flex-shrink-0 items-center">
        <div className="flex-grow relative">
          <input
            type="text"
            className="input-light !py-4 !px-8 !rounded-2xl border-[#eee] text-sm font-medium w-full shadow-lg shadow-[#f9ae9b]/5"
            placeholder="Encrypt and transmit briefing..."
            value={newMessage}
            onChange={handleTyping}
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-14 h-14 rounded-2xl bg-[#f9ae9b] shadow-xl shadow-[#f9ae9b]/30 flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition-all active:scale-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
}
