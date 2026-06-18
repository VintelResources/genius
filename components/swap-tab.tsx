"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function SwapTab() {
  return (
    <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
            Swap
          </div>
          <h2 className="text-2xl font-semibold text-white">Convert GENI</h2>
        </div>
        <ConnectButton />
      </div>

      <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-4 text-white">
        Swap tab is now active.
      </div>
    </section>
  );
}

