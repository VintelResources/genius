'use client';
import { useState } from 'react';
import { speak } from '@/utils/speech';

export default function GameMode({ words }: { words: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  const targetWord = words[currentIndex];

  const handleCheck = () => {
    if (guess.toUpperCase() === targetWord.word.toUpperCase()) {
      setMessage('Correct! Well done!');
    } else {
      setMessage('Try again!');
    }
  };

  if (words.length === 0) return <p>No words available to play.</p>;

  return (
    <div className="p-8 border rounded-xl shadow-lg bg-indigo-50">
      <h2 className="text-xl font-bold mb-4">Spell the Word!</h2>
      <p className="mb-4 text-lg">Hint: {targetWord.hint}</p>
      <button onClick={() => speak(targetWord.hint)} className="mb-4">🔊 Hear Hint</button>
      
      <input 
        className="block w-full p-3 mb-4 border rounded" 
        value={guess} 
        onChange={(e) => setGuess(e.target.value)} 
        placeholder="Type the word here..."
      />
      
      <button onClick={handleCheck} className="bg-green-600 text-white p-3 rounded w-full font-bold">
        Check Answer
      </button>
      
      <p className="mt-4 font-semibold text-center">{message}</p>
    </div>
  );
}

