import { getDailyChallengeData } from "@/actions/aiGenerator";

export default async function DailyPage() {
  const dailyChallenge = await getDailyChallengeData();

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-lime-300/20 bg-lime-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-lime-200">
            Daily Route
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">Daily Challenge</h1>
          <p className="mt-2 text-sm text-white/70">
            A fresh spotlight challenge for the day.
          </p>
        </section>

        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.3em] text-lime-200/80">
            {dailyChallenge.date}
          </div>

          <div className="mt-4 rounded-2xl border border-lime-300/20 bg-lime-400/10 p-4">
            <div className="text-sm text-white/80">
              <span className="font-semibold text-white">Hint:</span> {dailyChallenge.hint}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-white/60">
              Jumbled Word
            </div>
            <div className="mt-3 bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-5xl font-black uppercase tracking-[0.22em] text-transparent">
              {dailyChallenge.jumbledWord}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

