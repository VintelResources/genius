'use client';
import { useState } from 'react';

export default function CategoryHub({ subject, category, questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = questions[currentIndex];

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold'>{subject} Hub</h2>
        <p className='text-gray-500'>Level: {category}</p>
      </div>

      <div className='p-6 border rounded-lg bg-gray-50'>
        <p className='text-lg font-semibold mb-4'>{currentQ.question}</p>
        <div className='grid gap-3'>
          {JSON.parse(currentQ.options).map((opt: string) => (
            <button key={opt} className='p-3 border rounded hover:bg-blue-100 transition'>
              {opt}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))}
        className='mt-6 w-full bg-blue-600 text-white py-2 rounded'
      >
        Next Challenge
      </button>
    </div>
  );
}

