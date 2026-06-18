
import React from 'react';
const { useState, useRef, useEffect } = React;
import { UserLevel } from '../types';
import type { Subject, ChatMessage } from '../types';
import { getTutorResponse, generateTextToSpeech, decode, decodeAudioData } from '../services/geminiService';
import LiveVoiceTutor from './LiveVoiceTutor';
import { LEVEL_CONFIG } from '../components/constants';

interface AITutorProps {
  userLevel: UserLevel;
  activeSubject?: Subject | string;
}

const AITutor: React.FC<AITutorProps> = ({ userLevel, activeSubject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: `Greetings! I am your personal **Little Genius** mentor. How can I help you explore today? Try asking me about complex topics or for a pronunciation guide!`, 
          timestamp: new Date() 
        }
      ]);
    }
  }, []);

  /**
   * Auto-Narration Logic: "Read the answer soon after it is rendered"
   * Triggers narration for any model response that is newly added to the chat.
   */
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model' && isOpen && !isLoading) {
      const timer = setTimeout(() => {
        // Only auto-speak the main text (stripping markdown-like symbols for better TTS)
        const cleanText = lastMessage.text.replace(/\*\*/g, '').replace(/\[.*?\]/g, '');
        handleSpeak("AUTO_NARRATION", cleanText);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isOpen, isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const contextPrompt = `[USER_LEVEL: ${userLevel}] Inquiry: ${input}`;
    const responseText = await getTutorResponse(
      `${contextPrompt}

Subject: ${activeSubject}

Previous messages:
${messages.map((m) => `${m.role}: ${m.text ?? m.content ?? ""}`).join("\n")}`
    );
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleSpeak = async (word: string, guide?: string) => {
    if (isAudioLoading && word !== "AUTO_NARRATION") return;
    setIsAudioLoading(word);
    try {
      const voice = userLevel === UserLevel.KINDERGARTEN ? 'Puck' : 'Zephyr';
      const ttsText = guide || word;

      const base64 = await generateTextToSpeech(`${ttsText} Voice: ${voice}`);
      
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();
        
        const bytes = decode(base64);
        const buffer = await ctx.decodeAudioData(bytes.buffer as ArrayBuffer);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsAudioLoading(null);
        source.start(0);
      } else {
        setIsAudioLoading(null);
      }
    } catch (e) {
      console.error("Pronunciation playback failed", e);
      setIsAudioLoading(null);
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\w+\s+\[[a-zA-Z- ]+\])/g);
    return parts.map((part, i) => {
      const phoneticMatch = part.match(/^(\w+)\s+\[([a-zA-Z- ]+)\]$/);
      if (phoneticMatch) {
        const word = phoneticMatch[1];
        const guide = phoneticMatch[2];
        return (
          <span key={i} className="inline-flex items-center gap-1 group">
            <span className="font-bold underline decoration-indigo-300 underline-offset-2">{word}</span>
            <button 
              onClick={() => handleSpeak(word, guide)}
              disabled={!!isAudioLoading}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm border ${
                isAudioLoading === word 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              <span>{isAudioLoading === word ? 'ðŸ”Š' : 'ðŸ—£ï¸'}</span>
              <span>{guide}</span>
            </button>
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {isLiveMode && <LiveVoiceTutor userLevel={userLevel} onClose={() => setIsLiveMode(false)} />}
      
      <div className="fixed bottom-10 right-10 z-[60] flex flex-col items-end">
        {isOpen && (
          <div className="w-[400px] h-[650px] bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col mb-6 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl">âœ¨</div>
                 <div>
                   <h3 className="font-black tracking-tight">AI Mentor</h3>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-indigo-300">Active Node</span>
                   </div>
                 </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsLiveMode(true)} className="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500">Live</button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 custom-scroll">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
                  }`}>
                    {m.role === 'model' ? renderMessageText(m.text) : m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 p-4 bg-white rounded-2xl w-fit shadow-sm">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                </div>
              )}
            </div>

            <div className="p-6 bg-indigo-50/50 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Hands-Free: Auto-narration active.</span>
               </div>
               <div className="flex gap-4">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your mentor..."
                  className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-600 transition-all font-bold text-sm shadow-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white p-5 rounded-2xl hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M231.87,114l-168-95.89A16,16,0,0,0,40.92,37.34L71.55,128,40.92,218.67A16,16,0,0,0,56,240a16.15,16.15,0,0,0,7.93-2.1l167.94-95.89a16,16,0,0,0,0-28ZM56,224l30-88h88a8,8,0,0,0,0-16H86L56,32,224,128Z"></path></svg>
                </button>
               </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 px-6 rounded-full shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all active:scale-95 relative ${isOpen ? 'bg-slate-900 w-16' : 'bg-indigo-600'}`}
        >
          {isOpen ? (
            <span className="text-2xl text-white">âœ•</span>
          ) : (
            <>
              <span className="text-2xl text-white">ðŸ¤–</span>
              <span className="text-white font-black tracking-widest uppercase text-sm">Ask AI</span>
            </>
          )}
          {!isOpen && <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">LIVE</div>}
        </button>
      </div>
    </>
  );
};

export default AITutor;








