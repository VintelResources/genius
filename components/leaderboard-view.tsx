"use client";

type LeaderboardEntry = {
  rank: string;
  scholar: string;
  points: number;
  badge: string;
  earnings: string;
  minted: string;
  isCurrentUser?: boolean;
};

const leaderboard: LeaderboardEntry[] = [
  {
    rank: "🥇",
    scholar: "You",
    points: 23,
    badge: "Mastery",
    earnings: "0.00 G",
    minted: "Minted",
    isCurrentUser: true
  }
];

export default function LeaderboardView() {
  const hasTraffic = leaderboard.length > 1;

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Global Hall of Fame
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">
          The top neural miners in the global knowledge economy.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          Awaiting Global Traffic Registration
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
            Leaderboard
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <div className="grid grid-cols-4 gap-3 border-b border-white/10 px-4 py-4 text-xs uppercase tracking-[0.2em] text-white/50">
              <div>Rank</div>
              <div>Scholar</div>
              <div>Points</div>
              <div>Earnings</div>
            </div>

            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.scholar}-${index}`}
                className={`grid grid-cols-4 gap-3 px-4 py-5 text-sm ${
                  index !== leaderboard.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <div className="flex items-center text-2xl">{entry.rank}</div>

                <div className="min-w-0">
                  <div className="font-semibold text-white">{entry.scholar}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.15em] text-cyan-100">
                    {entry.badge}
                  </div>
                </div>

                <div className="flex items-center font-semibold text-white">
                  {entry.points}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-white">{entry.earnings}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/50">
                    {entry.minted}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasTraffic ? (
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
              You are the first pioneer. Invite others to compete!
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Reflective Ecosystem
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Traffic drops are being recorded. As more users join the ecosystem,
              their stats will dynamically populate this leaderboard.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <div className="text-3xl">🌍</div>
              <div>
                <div className="font-semibold text-white">Global Network Ready</div>
                <div className="mt-1 text-sm text-white/70">
                  Live ranking expansion begins as more scholars enter the protocol.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Current Node Position
            </div>
            <div className="mt-3 text-5xl font-black text-white">#1</div>
            <div className="mt-2 text-sm text-white/75">
              Your node currently leads the ecosystem by default as the founding scholar.
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

