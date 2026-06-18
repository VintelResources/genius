import LeaderboardTab from "@/components/leaderboard-tab";

export default function LeaderboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
            Leaderboard Route
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">Top Learners</h1>
          <p className="mt-2 text-sm text-white/70">
            Track the best streaks, total correct answers, and GENI earned.
          </p>
        </section>

        <LeaderboardTab />
      </div>
    </main>
  );
}

