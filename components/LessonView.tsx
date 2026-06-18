"use client";

import React from 'react';
const { useState, useEffect, useCallback, useRef } = React;
import { motion, AnimatePresence } from 'framer-motion';
import { generateLessonContent, generateTextToSpeech, decode, decodeAudioData } from '../services/geminiService';
import { TOKEN_CONSTANTS } from '../types';
import { UserLevel } from '../types';
import type { UserProfile } from '../types';
import type { Subject } from '../types';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

import { LEVEL_SUBJECTS, SUBJECT_ICONS } from './constants';
// Instead of import { ... } from '../types';

interface LessonViewProps {
  profile: UserProfile;
  initialTopic?: string;
  onComplete: (amount: number) => void;
}

const LessonView: React.FC<LessonViewProps> = ({ profile, initialTopic, onComplete }) => {
  const [topic, setTopic] = useState<Subject | string>(initialTopic || (LEVEL_SUBJECTS[profile.level] ?? [initialTopic ?? "General Knowledge"])[0]);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<{ score: number; completed: boolean } | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsNarrating(false);
  };

  const startNarration = async (text: string) => {
    if (isNarrating) return;
    setIsNarrating(true);
    try {
      const voice = profile.level === UserLevel.KINDERGARTEN ? 'Puck' : 'Zephyr';
      const base64 = await generateTextToSpeech(`${text} Voice: ${voice}`);
      
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
        source.onended = () => setIsNarrating(false);
        
        audioSourceRef.current = source;
        source.start(0);
      } else {
        setIsNarrating(false);
      }
    } catch (e) {
      console.error("Narration failed", e);
      setIsNarrating(false);
    }
  };

  const handleManualNarration = () => {
    if (isNarrating) stopAudio();
    else if (lesson) startNarration(lesson.fullContent);
  };

  const loadLesson = async (targetTopic?: string) => {
    const finalTopic = targetTopic || topic;
    setLoading(true);
    stopAudio();
    setShowQuiz(false);
    setQuizResults(null);
    try {
      const data = await generateLessonContent(`Topic: ${finalTopic}. Level: ${profile.level}. Difficulty: ${difficulty}`);
      setLesson({ title: finalTopic, summary: data.slice(0, 180), fullContent: data, quiz: [] });
      if (autoNarrate) {
          setTimeout(() => startNarration(data), 800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      loadLesson(initialTopic);
    } else {
      loadLesson();
    }
    return () => stopAudio();
  }, [initialTopic]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Adaptive Protocol</span>
             <button 
                onClick={() => setAutoNarrate(!autoNarrate)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    autoNarrate ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
             >
                <div className={`w-2 h-2 rounded-full ${autoNarrate ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></div>
                Auto-Narrate: {autoNarrate ? 'ON' : 'OFF'}
             </button>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Deep <span className="text-indigo-600">Learning.</span>
          </h2>
        </div>

        <div className="flex bg-white p-2 rounded-[2rem] border-2 border-slate-50 shadow-sm">
           {(LEVEL_SUBJECTS[profile.level] ?? []).map(subj => (
             <button 
                key={subj} 
                onClick={() => { setTopic(subj); loadLesson(subj); }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${topic === subj ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
                title={subj}
             >
                {SUBJECT_ICONS[subj as Subject] || 'ðŸ“–'}
             </button>
           ))}
        </div>
      </header>

      {loading ? (
        <div className="glass rounded-[4rem] min-h-[600px] flex flex-col items-center justify-center p-24 border-2 border-indigo-50">
           <div className="relative w-32 h-32 mb-8 animate-bounce">ðŸ§¬</div>
           <h3 className="text-3xl font-black text-slate-900 mb-2">Generating Knowledge</h3>
        </div>
      ) : lesson ? (
        <div className="grid lg:grid-cols-12 gap-12">
          <article className="lg:col-span-8 space-y-8">
            <div className="glass rounded-[4rem] p-12 md:p-20 shadow-xl border-white border-2 relative overflow-hidden group">
               <div className="absolute top-10 right-10 z-20 flex gap-4">
                  <button 
                    onClick={handleManualNarration}
                    className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${
                      isNarrating ? 'bg-rose-600 text-white' : 'bg-white text-indigo-600 border-2 border-indigo-50 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{isNarrating ? 'â¹' : 'ðŸ”Š'}</span>
                    {isNarrating ? 'Stop' : 'Narration'}
                  </button>
               </div>

               <div className="max-w-3xl relative z-10 space-y-12">
                  <header>
                    <h3 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8">{lesson.title}</h3>
                  </header>

                   {/* Key Takeaways - Now always visible */}
                   {lesson.keyHighlights && lesson.keyHighlights.length > 0 && (
                     <div className="mb-12 bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                       <h5 className="text-sm flex items-center gap-2 font-black text-indigo-900 uppercase tracking-widest mb-6">
                          <span className="text-indigo-600">âš¡</span> Key Takeaways
                       </h5>
                       <ul className="space-y-4">
                         {lesson.keyHighlights.map((h: string, i: number) => (
                           <li key={i} className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 font-black text-xs mt-0.5">
                                 {i+1}
                              </div>
                              <p className="text-sm font-medium text-slate-700 leading-relaxed">{h}</p>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                  {/* New Inline AI Summary Feature */}
                  <div className="mb-12">
                    <button 
                      onClick={() => setShowSummary(!showSummary)}
                      className="group flex items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] w-full hover:bg-slate-800 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shadow-lg">âœ¨</div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Protocol</p>
                        <h4 className="text-xl font-black text-white">Adaptive Lesson Briefing</h4>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-white transition-transform ${showSummary ? 'rotate-180' : ''}`}>
                        â†“
                      </div>
                    </button>

                    <AnimatePresence>
                      {showSummary && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-700">
                             <div className="absolute top-0 right-0 p-8 text-7xl opacity-5 pointer-events-none rotate-12">ðŸ““</div>
                             <p className="text-indigo-200 font-bold leading-relaxed relative z-10">
                                {lesson.summary}
                             </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="prose prose-slate max-w-none prose-xl font-medium text-slate-700 leading-relaxed space-y-8">
                     {lesson.fullContent.split('\n\n').map((para: string, i: number) => (
                        <p key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                          {para}
                        </p>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex justify-center pt-8">
               {!showQuiz && (
                 <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-slate-900 text-white px-16 py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-6"
                 >
                   Verify Knowledge ðŸ§©
                 </button>
               )}
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-8">
             <div className="glass rounded-[3.5rem] p-8 border-white border-2 shadow-2xl relative overflow-hidden flex flex-col">
                <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <span className="text-2xl text-indigo-600">ðŸ§ </span> Learning Insights
                </h4>
                
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-500 font-medium text-xs">
                    "This lesson node is optimized for your {profile.level} profile with AI-driven complexity adjustments."
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Discovery Status</span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase">Synced</span>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Est. Playtime</span>
                    <span className="text-[10px] font-black text-indigo-700 uppercase">5-8 Mins</span>
                  </div>
                </div>
             </div>
          </aside>
        </div>
      ) : null}

      {showQuiz && lesson && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl p-8 flex items-center justify-center overflow-y-auto">
           <div className="max-w-4xl w-full bg-white rounded-[4rem] p-12 md:p-20 shadow-[0_0_100px_rgba(79,70,229,0.2)]">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-4xl font-black text-slate-900">Verification Hub</h3>
                 <button onClick={() => setShowQuiz(false)} className="text-slate-300">âœ•</button>
              </div>

              <div className="space-y-12">
                 {quizResults ? (
                    <div className="text-center py-12">
                       <h4 className="text-5xl font-black text-slate-900 mb-4">Module Mastered!</h4>
                       <button 
                        onClick={() => { 
                          setShowQuiz(false); 
                          loadLesson(); 
                          const reward = TOKEN_CONSTANTS.INITIAL_REWARDS.MODULE_MASTERED;
                          onComplete(reward); 
                        }}
                        className="bg-indigo-600 text-white px-16 py-8 rounded-[3rem] font-black text-2xl"
                       >
                         Continue âœ¨
                       </button>
                    </div>
                 ) : (
                    <div className="text-center space-y-8">
                        <p className="text-2xl font-bold text-slate-600 italic">Ready to validate this knowledge block?</p>
                        <button 
                            onClick={() => setQuizResults({ score: 10, completed: true })}
                            className="bg-slate-900 text-white px-16 py-8 rounded-[3rem] font-black text-2xl"
                        >
                            Start Assessment
                        </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LessonView;



















