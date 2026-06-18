"use client";

import { useMemo, useState } from "react";

type ReferralEntry = {
  name: string;
  joined: string;
  reward: string;
};

function buildReferralCode(seed: string) {
  const normalized = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `GENI-${(normalized || "LEARNER").slice(0, 8)}`;
}

export default function ReferralsView() {
  const [displayName] = useState("You");
  const [copied, setCopied] = useState(false);
  const [referrals] = useState<ReferralEntry[]>([]);

  const referralCode = useMemo(() => buildReferralCode(displayName), [displayName]);
  const referralLink = useMemo(
    () => `https://little-genius.app/join?ref=${referralCode}`,
    [referralCode]
  );

  const totalEarned = useMemo(() => {
    return (referrals.length * 0.0001).toFixed(4);
  }, [referrals]);

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Grow the Community
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">Refer and Earn</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          Invite your friends to Little Genius and you both earn a bonus of
          <span className="font-semibold text-white"> 0.0001 Genius Tokens </span>
          when they join.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Your Referral Code
            </div>
            <div className="mt-3 text-3xl font-black text-white">{referralCode}</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/80 break-all">
              {referralLink}
            </div>

            <button
              type="button"
              onClick={copyReferralLink}
              className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
            >
              {copied ? "Copied" : "Copy Referral Link"}
            </button>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Reward Rule
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                You earn <span className="font-semibold text-white">0.0001 G</span> for each successful referral.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                Your invited learner also earns <span className="font-semibold text-white">0.0001 G</span> when they join.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                Referral growth helps expand the Little Genius learning ecosystem.
              </div>
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-emerald-300/20 bg-emerald-500/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-100">
              Referral Earnings
            </div>
            <div className="mt-3 text-5xl font-black text-white">{totalEarned}</div>
            <div className="mt-2 text-lg font-semibold text-emerald-100">G</div>
            <div className="mt-3 text-sm text-white/80">
              Total Genius token bonuses earned from community referrals.
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Invited Friends
            </div>

            {referrals.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                No referrals registered yet. Share your link to start growing the community.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {referrals.map((entry, index) => (
                  <div
                    key={`${entry.name}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-white">{entry.name}</div>
                        <div className="mt-1 text-sm text-white/65">{entry.joined}</div>
                      </div>
                      <div className="text-lg font-black text-cyan-100">{entry.reward}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}

