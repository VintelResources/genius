"use client";

import Image from "next/image";
import { useState } from "react";
import { SpellingPractice } from "@/components/spelling-practice";
import WalletTab from "@/components/wallet-tab";
import LeaderboardTab from "@/components/leaderboard-tab";

export default function PlayPage() {
  const [rewardNonce, setRewardNonce] = useState(0);

  function handleRewarded() {
    setRewardNonce((value) => value + 1);
  }

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/5 p-2 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
              <Image
                src="/genius-logo.png"
                alt="Genius Web logo"
                width={128}
                height={128}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div>
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
                Play Arena
              </div>
              <h1 className="mt-3 bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
                Learn. Earn. Become a Genius.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
                Solve spelling challenges, build streaks, and earn GENI rewards directly to your wallet.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <SpellingPractice onRewarded={handleRewarded} />
          <div className="space-y-6">
            <WalletTab rewardNonce={rewardNonce} />
            <LeaderboardTab />
          </div>
        </div>
      </div>
    </main>
  );
}

