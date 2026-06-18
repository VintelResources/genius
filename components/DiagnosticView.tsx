"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, QuizQuestion, LearningPath } from '../types';
import { generateExamContent, generateDiagnosticPath } from '../services/geminiService';

interface DiagnosticViewProps {
  profile: UserProfile;
  onPathGenerated: (path: LearningPath) => void;
  onCancel: () => void;
}

const DiagnosticView: React.FC<DiagnosticViewProps> = ({ profile, onPathGenerated, onCancel }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ question: string, isCorrect: boolean, expected: string, userAns: string }[]>([]);
  const [generatingPath, setGeneratingPath] = useState(false);

  useEffect(() => {
    // Generate diagnostic exam
    setLoading(true);
    generateExamContent(profile.level, ['General Knowledge', 'Science', 'Math', 'History'], 5, "MEDIUM")
      .then(res => {
        setQuestions((res.questions || []) as QuizQuestion[]);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [profile.level]);

  const handleAnswer = (index: number) => {
    const q = questions[currentIndex];
    const isCorrect = index === q.correctIndex;
    setResults(prev => [...prev, {
      question: q.question,
      isCorrect,
      expected: q.options[q.correctIndex],
      userAns: q.options[index]
    }]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Test complete, generate path
      setGeneratingPath(true);
      generateDiagnosticPath(profile.level, [...results, {
        question: q.question,
        isCorrect,
        expected: q.options[q.correctIndex],
        userAns: q.options[index]
      }]).then(customPath => {
        onPathGenerated((customPath.path ?? customPath) as LearningPath);
      }).catch(err => {
        console.error(err);
        setGeneratingPath(false);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-black text-indigo-900 uppercase tracking-widest animate-pulse">Building Diagnostic Sequence...</p>
      </div>
    );
  }

  if (generatingPath) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <div className="text-4xl mb-6">ðŸ§ </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4">Analyzing Results</h3>
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-md">We are synthesizing your performance across domains to craft a personalized learning trajectory designed for maximum growth.</p>
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
           <motion.div className="h-full bg-indigo-600" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-900">Diagnostic Assessment</h2>
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">Cancel</button>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8 text-xs font-black uppercase tracking-widest text-slate-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{profile.level}</span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-10 leading-tight">{currentQ.question}</h3>

        <div className="space-y-4">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 font-medium text-slate-700 transition-all group flex items-center justify-between"
            >
              <span>{opt}</span>
              <span className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-indigo-600 transition-all">{String.fromCharCode(65 + i)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticView;






