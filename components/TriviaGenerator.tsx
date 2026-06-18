"use client";

import { useState } from "react";

export default function TriviaGenerator() {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");

  function generateLocalQuestion() {
    const cleanTopic = topic.trim() || "general knowledge";
    setQuestion(`What is one important fact about ${cleanTopic}?`);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white">
      <h2 className="text-2xl font-black">Trivia Generator</h2>
      <p className="mt-2 text-sm text-slate-300">
        Generate a simple starter trivia question.
      </p>

      <input
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Enter a topic"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
      />

      <button
        onClick={generateLocalQuestion}
        className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950"
      >
        Generate Question
      </button>

      {question ? (
        <div className="mt-4 rounded-xl bg-white/10 p-4">
          {question}
        </div>
      ) : null}
    </div>
  );
}

