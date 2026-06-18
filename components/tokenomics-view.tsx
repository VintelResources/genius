"use client";

const protocolStats = [
  {
    label: "Max Supply",
    value: "21,000,000 G",
    hint: "Fixed supply cap."
  },
  {
    label: "Genesis Block",
    value: "Verified 2025",
    hint: "Protocol launch reference."
  },
  {
    label: "Consensus",
    value: "Global Trivia",
    hint: "Proof of Knowledge validation."
  },
  {
    label: "Current Reward",
    value: "0.010 G",
    hint: "Current validation subsidy."
  }
];

const miningCards = [
  {
    icon: "⛏️",
    title: "Knowledge Validation",
    reward: "0.0100 G"
  },
  {
    icon: "🏆",
    title: "Protocol Assessment",
    reward: "0.0100 G"
  },
  {
    icon: "📚",
    title: "Pathway Mastery",
    reward: "0.00010 G"
  }
];

const allocations = [
  {
    icon: "⛏️",
    title: "Mining Rewards (Public PoK)",
    percent: "50% Cap",
    amount: "10,500,000 G"
  },
  {
    icon: "🌱",
    title: "Ecosystem Growth",
    percent: "20% Cap",
    amount: "4,200,000 G"
  },
  {
    icon: "🤝",
    title: "Strategic Partnerships",
    percent: "15% Cap",
    amount: "3,150,000 G"
  },
  {
    icon: "🛠️",
    title: "Core Team & Development",
    percent: "10% Cap",
    amount: "2,100,000 G"
  },
  {
    icon: "🌊",
    title: "Liquidity Pools",
    percent: "5% Cap",
    amount: "1,050,000 G"
  }
];

export default function TokenomicsView() {
  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Tokenomics
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">Genius Protocol</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          LITTLE GENIUS introduces a peer-to-peer knowledge validation protocol. Unlike traditional economies,
          G is emitted purely through the validation of truth. This model is called <span className="font-semibold text-white">Proof of Knowledge (PoK)</span>.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Fixed Supply Algorithm
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              21,000,000 G Max Cap
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              The total circulation is mathematically capped at <span className="font-semibold text-white">21,000,000 G</span>.
              Every <span className="font-semibold text-white">2,625,000 G</span> issued, the reward per validation halves while the mining difficulty remains static.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {protocolStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-2 text-sm text-white/65">{item.hint}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Mining Difficulty Adjustment
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Halving Cycle Logic
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              The protocol automatically adjusts emission rates based on halving cycles. As issuance progresses through epochs,
              the subsidy paid for successful knowledge validation reduces, preserving scarcity in the same fixed-supply spirit.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-100">
                Daily Cap Status
              </div>
              <div className="mt-2 text-3xl font-black text-white">901% mined</div>
            </div>

            <div className="mt-5 space-y-3">
              {miningCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{card.icon}</div>
                      <div className="text-lg font-semibold text-white">{card.title}</div>
                    </div>
                    <div className="text-lg font-black text-cyan-100">{card.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
              Allocation Transparency
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Supply Audit
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Directly mirroring the Bitcoin philosophy, G is distributed with full visibility.
              <span className="font-semibold text-white"> 50% of all tokens </span>
              are strictly reserved for the global nodes, meaning learners mining through PoK.
            </p>

            <div className="mt-5 space-y-3">
              {allocations.map((allocation) => (
                <div
                  key={allocation.title}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">{allocation.icon}</div>
                      <div>
                        <div className="text-lg font-semibold text-white">{allocation.title}</div>
                        <div className="mt-1 text-sm text-white/65">Allocation: {allocation.percent}</div>
                      </div>
                    </div>
                    <div className="text-right text-lg font-black text-white">{allocation.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-amber-300/20 bg-amber-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-amber-100">
              My Node Stash
            </div>
            <div className="mt-2 text-4xl font-black text-white">0.0000 G</div>
            <div className="mt-3 text-sm leading-6 text-white/80">
              Node rewards are earned through successful Proof of Knowledge validations and protocol participation.
            </div>
          </section>

          <section className="rounded-[28px] border border-red-300/20 bg-red-500/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-red-100">
              Impermanent Loss
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Liquidity Risk Notice
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              As a liquidity provider, if the price of G changes significantly compared to BNB while in the pool,
              you may experience impermanent loss.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              This is the risk of having less value than if you had simply held the assets separately.
              It is a core mechanic of Automated Market Makers such as PancakeSwap.
            </p>
          </section>

          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Locked Liquidity
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Trust Through Verifiable Locking
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Even if the pool is substantial, the public will only trust it if that liquidity is locked.
              Unlocked liquidity, no matter how large, is often viewed as a potential rug-pull risk.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              The Genius Protocol ensures core liquidity is verifiably locked via smart contracts, decentralizing trust
              and securing the financial foundation of the protocol.
            </p>
          </section>

          <section className="rounded-[28px] border border-fuchsia-300/20 bg-fuchsia-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-100">
              Reward Logic
            </div>
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                Emission is capped at 21,000,000 G.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                Reward halves every 2,625,000 G issued.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                PoK validation is the only emission path.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                Learners act as global nodes in the protocol.
              </div>
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

