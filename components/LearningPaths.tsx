"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject, UserProfile, LearningPath, PathStep } from '../types';
import { SUBJECT_ICONS } from './constants';
import { LEARNING_PATHS } from '../knowledgeData';
import DiagnosticView from './DiagnosticView';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface LearningPathsProps {
  profile: UserProfile;
  initialPathId?: string;
  onCompleteStep: (pathId: string, stepId: string, reward: number) => void;
  onStartLesson: (pathId: string, stepId: string, title: string) => void;
  onSaveCustomPath?: (path: LearningPath) => void;
}

const LearningPaths: React.FC<LearningPathsProps> = ({ profile, initialPathId, onCompleteStep, onStartLesson, onSaveCustomPath }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(initialPathId || null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    if (initialPathId) {
      setActivePathId(initialPathId);
    }
  }, [initialPathId]);

  const allPaths = [...LEARNING_PATHS, ...(profile.customPaths || [])];
  const availablePaths = allPaths.filter(p => !selectedSubject || p.subject === selectedSubject || (p.subject === "Personalized Learning" && !selectedSubject));
  const activePath = allPaths.find(p => p.id === activePathId);

  const getPathProgress = (pathId: string) => {
    const progress = profile.learningPathProgress?.find(p => p.pathId === pathId);
    if (!progress) return 0;
    const path = allPaths.find(p => p.id === pathId);
    if (!path) return 0;
    return Math.round(((progress.completedSteps ?? []).length / path.steps.length) * 100);
  };

  const isStepCompleted = (pathId: string, stepId: string) => {
    const progress = profile.learningPathProgress?.find(p => p.pathId === pathId);
    return (progress?.completedSteps ?? []).includes(stepId);
  };

  const handleStepClick = (path: LearningPath, step: PathStep) => {
    if (isStepCompleted(path.id, step.id)) return;
    onStartLesson(path.id, step.id, `${path.subject}: ${step.title} - ${step.description}`);
  };

  const subjects = Array.from(new Set(allPaths.map(p => p.subject as string)));

  if (showDiagnostic) {
    return (
      <DiagnosticView 
        profile={profile} 
        onCancel={() => setShowDiagnostic(false)} 
        onPathGenerated={(path) => {
          if (onSaveCustomPath) onSaveCustomPath(path);
          setActivePathId(path.id);
          setShowDiagnostic(false);
        }} 
      />
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Header section with Editorial vibe */}
      <section className="relative py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter"
          >
            LEARNING <br/>
            <span className="text-indigo-600">PATHWAYS.</span>
          </motion.h1>
          <p className="mt-6 text-slate-500 text-lg font-medium max-w-xl">
            Curated journeys through the most critical domains of human knowledge. 
            Follow the path, earn rewards, and master your future.
          </p>
        </div>
        <button
          onClick={() => setShowDiagnostic(true)}
          className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-colors flex items-center gap-3 shrink-0"
        >
          <span className="text-xl">ðŸŽ¯</span> Take Diagnostic Test
        </button>
      </section>

      {/* Subject Filter */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setSelectedSubject(null); setActivePathId(null); }}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedSubject ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
        >
          All Domains
        </button>
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => { setSelectedSubject(subject as Subject); setActivePathId(null); }}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedSubject === subject ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            <span>{SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS] || 'ðŸ§ '}</span>
            {subject}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!activePathId ? (
          <motion.div 
            key="path-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {availablePaths.map(path => {
              const progress = getPathProgress(path.id);
              return (
                <motion.div
                  key={path.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col group cursor-pointer"
                  onClick={() => setActivePathId(path.id)}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-all border border-slate-100">
                      {SUBJECT_ICONS[path.subject as keyof typeof SUBJECT_ICONS] || 'ðŸ§ '}
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">domain</span>
                       <span className="text-xs font-bold text-slate-900 underline decoration-indigo-200 underline-offset-4">{path.subject}</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{path.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-12 line-clamp-2">{path.description}</p>

                  <div className="mt-auto pt-8 border-t border-slate-50">
                    <div className="flex justify-between items-end mb-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                          <span className="text-2xl font-black text-slate-900">{progress}%</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reward</span>
                          <span className="text-sm font-black text-emerald-500">{path.totalReward} XP</span>
                       </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="active-path"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-2xl relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />
            
            <button 
              onClick={() => setActivePathId(null)}
              className="mb-12 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              â† Back to Pathways
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
               <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active learning path</span>
                     <span className="text-slate-400 text-xs font-bold">â€¢</span>
                     <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{activePath?.subject}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter mb-6">{activePath?.title}</h2>
                  <p className="text-slate-500 text-lg font-medium">{activePath?.description}</p>
               </div>
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-w-[200px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">overall progress</span>
                  <div className="relative w-24 h-24 mb-4">
                     <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <motion.circle 
                           className="text-indigo-600" 
                           strokeWidth="8" 
                           strokeDasharray="251.2"
                           strokeDashoffset={251.2 - (251.2 * getPathProgress(activePathId) / 100)}
                           strokeLinecap="round" 
                           stroke="currentColor" 
                           fill="transparent" 
                           r="40" cx="50" cy="50" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900">
                        {getPathProgress(activePathId)}%
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               {activePath?.steps.map((step, index) => {
                 const isCompleted = isStepCompleted(activePath.id, step.id);
                 return (
                   <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center gap-8 ${isCompleted ? 'bg-indigo-50/30 border-indigo-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-600 hover:shadow-xl'}`}
                   >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                        {isCompleted ? 'âœ“' : index + 1}
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}>
                              {'MEDIUM'}
                           </span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{'15 min'}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">{step.title}</h4>
                        <p className="text-slate-500 text-sm font-medium">{step.description}</p>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reward</span>
                           <span className="text-sm font-black text-emerald-500">{25} XP</span>
                        </div>
                        <button
                          disabled={isCompleted}
                          onClick={() => handleStepClick(activePath, step)}
                          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'}`}
                        >
                          {isCompleted ? 'Mastered' : 'Start Lesson'}
                        </button>
                     </div>
                   </motion.div>
                 );
               })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPaths;
















