"use client";
import { useEffect, useState } from 'react';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  return (
    <div>
      {questions.map((q: any) => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          <ul>
            {q.options.map((opt: string) => <li key={opt}>{opt}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

