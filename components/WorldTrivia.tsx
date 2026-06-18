"use client";

import React from 'react';
const { useState, useEffect, useCallback, useRef } = React;
import { generateGlobalTrivia, generateTextToSpeech, decode, decodeAudioData } from '../services/geminiService';
import { UserLevel, TOKEN_CONSTANTS, QuestionType } from '../types';
import type { QuizQuestion } from '../types';

interface WorldTriviaProps {
  userLevel: UserLevel;
  onCorrectAnswer: (amount: number) => void;
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
const DIFFICULTY_OPTIONS: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
type SyncStep = 'INITIALIZING' | 'FETCHING_TRIVIA' | 'SYNTHESIZING_PRIMARY' | 'READY';

const WorldTrivia: React.FC<WorldTriviaProps> = ({ userLevel, onCorrectAnswer }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStep, setSyncStep] = useState<SyncStep>('INITIALIZING');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string; selectedIndex: number | null } | null>(null);
  const [seenQuestions, setSeenQuestions] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [audioAvailable, setAudioAvailable] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const cachedExplanationBuffer = useRef<AudioBuffer | null>(null);
  const cachedCorrectPrefixBuffer = useRef<AudioBuffer | null>(null);
  const cachedIncorrectPrefixBuffer = useRef<AudioBuffer | null>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as any;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const preloadAudioBuffer = async (text: string): Promise<AudioBuffer | null> => {
    try {
      const voice = userLevel === UserLevel.KINDERGARTEN ? 'Puck' : 'Zephyr';
      const base64 = await generateTextToSpeech(`${text} Voice: ${voice}`);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();
        const bytes = decode(base64);
        setAudioAvailable(true);
        return await ctx.decodeAudioData(bytes.buffer as ArrayBuffer);
      } else {
        setAudioAvailable(false);
      }
    } catch (e) {
      console.warn("Preload audio failed", e);
      setAudioAvailable(false);
    }
    return null;
  };

  const playBuffer = (buffer: AudioBuffer, onEnded?: () => void) => {
    if (!audioContextRef.current) return;
    stopAudio();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    audioSourceRef.current = source;
    source.start(0);
    setIsPlaying(true);
  };

  const shuffleQuestion = (q: QuizQuestion): QuizQuestion => {
    // We only shuffle MULTIPLE_CHOICE or FILL_IN_BLANKS. TRUE_FALSE is better kept static.
    if (q.type === QuestionType.TRUE_FALSE) return q;
    
    const correctAnswerText = q.options[q.correctIndex];
    const shuffledOptions = [...q.options];
    
    // Fisher-Yates Shuffle
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
    return { ...q, options: shuffledOptions, correctIndex: newCorrectIndex };
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const loadQuestion = useCallback(async (newDiff?: Difficulty, specificCategory?: string) => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setSyncStep('INITIALIZING');
    stopAudio();
    stopTimer();
    
    cachedExplanationBuffer.current = null;
    cachedCorrectPrefixBuffer.current = null;
    cachedIncorrectPrefixBuffer.current = null;

    const targetDiff = newDiff || difficulty;
    const targetCat = specificCategory || selectedCategory || "General Knowledge";
    
    try {
      setSyncStep('FETCHING_TRIVIA');
      const rawQuestion = await generateGlobalTrivia(seenQuestions, targetDiff, userLevel, targetCat);
      const q = shuffleQuestion(rawQuestion as unknown as QuizQuestion);
      
      setSyncStep('SYNTHESIZING_PRIMARY');
      const qBuffer = await preloadAudioBuffer(q.question);
      
      if (audioAvailable) {
        Promise.all([
          preloadAudioBuffer(q.explanation),
          preloadAudioBuffer(userLevel === UserLevel.KINDERGARTEN ? "Yay! You got it right!" : "Node verified. Correct."),
          preloadAudioBuffer(userLevel === UserLevel.KINDERGARTEN ? "Oops! Not quite right." : "Validation failed. That is incorrect.")
        ]).then(([exp, correct, incorrect]) => {
          cachedExplanationBuffer.current = exp;
          cachedCorrectPrefixBuffer.current = correct;
          cachedIncorrectPrefixBuffer.current = incorrect;
        });
      }

      setSyncStep('READY');
      setQuestion(q);
      setSeenQuestions(prev => [...prev, q.question]);
      
      requestAnimationFrame(() => {
        if (qBuffer) playBuffer(qBuffer);
        startTimer();
      });
      
    } catch (e) {
      setError("Synchronizing Knowledge Hub... Connection intermittent.");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [difficulty, selectedCategory, seenQuestions, userLevel, audioAvailable]);

  const playSequence = (buffers: (AudioBuffer | null)[]) => {
    const validBuffers = buffers.filter(b => b !== null) as AudioBuffer[];
    if (validBuffers.length === 0) return;

    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex < validBuffers.length) {
        playBuffer(validBuffers[currentIndex], () => {
          currentIndex++;
          playNext();
        });
      }
    };
    playNext();
  };

  /**
   * Automatically narrate the result and explanation soon after rendering.
   */
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        const prefix = feedback.isCorrect ? cachedCorrectPrefixBuffer.current : cachedIncorrectPrefixBuffer.current;
        playSequence([prefix, cachedExplanationBuffer.current]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopTimer();
    };
  }, []);

  const handleAnswer = (idx: number | null) => {
    if (feedback || !question) return;
    stopTimer();
    
    const isCorrect = idx === question.correctIndex;
    setFeedback({ 
      isCorrect, 
      explanation: idx === null ? `Time is up! ${question.explanation}` : question.explanation, 
      selectedIndex: idx 
    });
    
    if (isCorrect && idx !== null) {
      onCorrectAnswer(TOKEN_CONSTANTS.INITIAL_REWARDS.QUIZ_CORRECT);
    }
  };

  const handleTimeUp = () => {
    if (!feedback) {
      handleAnswer(null);
    }
  };

  const getSyncProgress = () => {
    switch(syncStep) {
      case 'INITIALIZING': return 25;
      case 'FETCHING_TRIVIA': return 50;
      case 'SYNTHESIZING_PRIMARY': return 80;
      case 'READY': return 100;
      default: return 0;
    }
  };

  const getSyncLabel = () => {
    switch(syncStep) {
      case 'INITIALIZING': return 'Neural Handshake...';
      case 'FETCHING_TRIVIA': return 'Mining Truth Block...';
      case 'SYNTHESIZING_PRIMARY': return 'Synthesizing Vocals...';
      case 'READY': return 'Synchronized.';
      default: return 'Awaiting Link...';
    }
  };

  const CATEGORIES = [
    "General Knowledge",
    "Science & Nature",
    "History & Geography",
    "Toddler Fun",
    "Language & Arts",
    "Technology & Space"
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Discovery <span className="text-indigo-600">Trivia</span></h2>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Proof of Knowledge</span>
            {hasStarted && question && (
              <>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                    {question?.type.replace('_', ' ')} Block
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {question && !feedback && !loading && hasStarted && (
            <div className="flex flex-col items-end group">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">T-Minus Validation</span>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-black tabular-nums transition-all ${timeLeft <= 5 ? 'text-rose-500 animate-pulse scale-110' : 'text-slate-900'}`}>
                  {timeLeft.toString().padStart(2, '0')}s
                </div>
                <div className="w-40 h-3 bg-slate-100 rounded-full overflow-hidden border border-white shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          {hasStarted && (
            <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white shadow-lg">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button 
                  key={d} onClick={() => { setDifficulty(d); loadQuestion(d); }}
                  className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${difficulty === d ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-xl scale-105' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!hasStarted ? (
        <div className="glass rounded-[4rem] min-h-[550px] flex flex-col items-center justify-center p-12 text-center border-2 border-indigo-100/30 bg-white shadow-[0_40px_100px_-30px_rgba(79,70,229,0.15)] relative">
          <h3 className="text-3xl font-black text-slate-900 mb-2">Select a Niche</h3>
          <p className="text-slate-500 font-medium mb-12">Choose a category to begin your trivia challenge.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-4 px-6 rounded-2xl font-bold transition-all border-2 ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-105' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
               if(selectedCategory) {
                 setHasStarted(true);
                 loadQuestion(difficulty, selectedCategory);
               }
            }}
            disabled={!selectedCategory}
            className="w-full max-w-sm bg-slate-900 text-white font-black text-2xl py-6 rounded-[2rem] hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-4"
          >
            Start Trivia <span>â†’</span>
          </button>
        </div>
      ) : loading ? (
        <div className="glass rounded-[4rem] min-h-[550px] flex flex-col items-center justify-center p-12 text-center border-2 border-indigo-100/30 bg-white shadow-[0_40px_100px_-30px_rgba(79,70,229,0.15)] overflow-hidden relative">
          <div className="relative z-10 w-full max-w-md">
            <div className="relative w-48 h-48 mx-auto mb-16">
               <div className="absolute inset-0 border-[6px] border-indigo-600/5 rounded-[4rem] animate-[spin_12s_linear_infinite]"></div>
               <div className="absolute inset-0 flex items-center justify-center text-5xl animate-[bounce_2s_ease-in-out_infinite]">ðŸ§ </div>
            </div>
            <div className="space-y-2 mb-10">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Mining <span className="text-indigo-600">Knowledge</span></h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">{getSyncLabel()}</p>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-white">
               <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${getSyncProgress()}%` }}></div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-[4rem] min-h-[500px] flex flex-col items-center justify-center p-24 text-center border-2 border-rose-100 bg-rose-50/20">
           <h3 className="text-4xl font-black text-slate-900 mb-4">Sync Interrupted</h3>
           <p className="text-slate-500 font-medium text-xl">{error}</p>
           <button onClick={() => loadQuestion()} className="mt-12 bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black">Retry Link</button>
        </div>
      ) : question ? (
        <div className="space-y-10">
          <div className="group glass rounded-[4rem] p-12 md:p-24 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] relative border-white border-2 overflow-hidden transition-all">
            <div className="absolute top-10 right-10 flex gap-3 z-20">
               {audioAvailable && (
                 <button 
                  onClick={() => {
                     stopAudio();
                     preloadAudioBuffer(question.question).then(b => b && playBuffer(b));
                  }}
                  className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl transition-all shadow-xl active:scale-90 ${isPlaying ? 'bg-rose-600 text-white' : 'bg-white text-slate-400 hover:bg-indigo-600 hover:text-white'}`}
                 >
                   {isPlaying ? 'â¹' : 'ðŸ”Š'}
                 </button>
               )}
            </div>
            
            <div className="max-w-4xl relative z-10 animate-in slide-in-from-left-8 duration-700">
              <div className="flex items-center gap-4 mb-8">
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     question.type === QuestionType.TRUE_FALSE ? 'bg-blue-100 text-blue-600' : 
                     question.type === QuestionType.FILL_IN_BLANKS ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                 }`}>
                     {question.type.replace('_', ' ')}
                 </span>
                 <span className="w-8 h-0.5 bg-slate-200 rounded-full"></span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight text-balance">
                {question.type === QuestionType.FILL_IN_BLANKS ? question.question.replace('____', '______') : question.question}
              </h3>
            </div>
            <div className="absolute -bottom-20 -right-20 text-[25rem] opacity-[0.03] pointer-events-none rotate-12 transition-transform group-hover:rotate-45 duration-1000">â“</div>
          </div>

          <div className={`grid gap-8 md:grid-cols-2`}>
            {question.options.map((opt, i) => (
              <button 
                key={i} onClick={() => handleAnswer(i)} disabled={!!feedback}
                className={`p-10 text-left rounded-[3.5rem] border-4 font-black text-2xl transition-all flex items-center gap-8 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-backwards`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl transition-all ${
                  feedback 
                    ? (i === question.correctIndex ? 'bg-emerald-600 text-white' : (feedback.selectedIndex === i ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-300'))
                    : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                }`}>
                  {question.type === QuestionType.TRUE_FALSE ? (opt === 'True' ? 'âœ“' : 'âœ—') : String.fromCharCode(65+i)}
                </div>
                <span className="flex-1 text-balance">{opt}</span>
                
                {feedback && i === question.correctIndex && <div className="text-4xl animate-bounce">âœ¨</div>}
                {feedback && feedback.selectedIndex === i && i !== question.correctIndex && <div className="text-4xl animate-shake">âŒ</div>}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="animate-in slide-in-from-top-12 fade-in duration-700">
               <div className={`p-16 rounded-[4.5rem] border-4 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                 <div className="text-9xl shrink-0 relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-500">
                    {feedback.selectedIndex === null ? 'â°' : (feedback.isCorrect ? 'âœ…' : 'âŒ')}
                 </div>
                 <div className="flex-1 relative z-10 text-center md:text-left">
                   <h4 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter leading-none uppercase">
                    {feedback.selectedIndex === null ? 'Timeout' : (feedback.isCorrect ? 'Verified' : 'Incorrect')}
                   </h4>
                   <p className="text-2xl font-bold opacity-80 leading-relaxed max-w-2xl">{feedback.explanation}</p>
                   <div className="mt-12 flex flex-wrap gap-4 justify-center md:justify-start">
                     <button 
                      onClick={() => loadQuestion()} 
                      className="bg-slate-900 text-white px-12 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-600 transition-all shadow-xl"
                     >
                       Next Challenge â†’
                     </button>
                     <button 
                      onClick={() => setHasStarted(false)} 
                      className="bg-white text-slate-900 border-4 border-slate-200 px-12 py-7 rounded-[2.5rem] font-black text-2xl hover:border-slate-400 transition-all shadow-xl"
                     >
                       Change Niche ðŸ”„
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      ) : null}
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WorldTrivia;











