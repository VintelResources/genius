"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  name: string;
  correct: number;
  bestStreak: number;
  totalEarned: number;
  updatedAt: number;
};

export default function LeaderboardTab() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("genius_leaderboard");
    const parsed = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
    setEntries(parsed);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const raw = window.localStorage.getItem("genius_leaderboard");
      const parsed = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
      setEntries(parsed);
    }, 1500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
          Leaderboard
        </div>
        <h2 className="text-2xl font-semibold text-white">Top Learners</h2>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/70">
          No leaderboard data yet. Start solving challenges.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    #{index + 1} {entry.name}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    Best streak: {entry.bestStreak}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-200">{entry.correct} correct</div>
                  <div className="text-xs text-fuchsia-200">
                    {entry.totalEarned.toFixed(8)} GENI
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

