'use client';
import { useState, useEffect } from 'react';
import { generateNewWord } from '@/actions/aiGenerator';
import { addWordManually } from '@/actions/manualWordActions';
import GameMode from '@/components/GameMode';
import { speak } from '@/utils/speech';

export default function SpellingApp() {
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [mode, setMode] = useState<'admin' | 'play'>('admin');

  const refreshWords = async () => {
    const res = await fetch('/api/words');
    const data = await res.json();
    setWords(Array.isArray(data) ? data : []);
  };

  useEffect(() => { refreshWords(); }, []);

  const handleAiGenerate = async () => {
    setLoading(true);
    const result = await generateNewWord('Medium');
    if (result) {
      refreshWords();
    } else {
      alert("AI limit reached. Please check your OpenAI billing or use manual entry.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setMode('admin')} className="p-2 border-b-2">Admin</button>
        <button onClick={() => setMode('play')} className="p-2 border-b-2">Play</button>
      </div>

      {mode === 'admin' ? (
        <div className="space-y-4">
          <button 
            className="bg-purple-600 text-white p-3 rounded w-full font-bold"
            onClick={handleAiGenerate}
            disabled={loading}
          >
            {loading ? 'Consulting AI...' : 'Auto-Generate with AI'}
          </button>
          <div className="mt-6 space-y-2">
            {words.map((w: any) => (
              <div key={w.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded">
                <span>{w.word}</span>
                <button onClick={() => speak(w.hint)}>🔊</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <GameMode words={words} />
      )}
    </div>
  );
}

