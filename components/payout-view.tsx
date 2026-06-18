"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

type SubjectOption =
  | "English"
  | "Science"
  | "History"
  | "Geography"
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Economics"
  | "Technology";

type SubsidyKey = "validation" | "assessment" | "pathway";

type PayoutRecord = {
  subject: SubjectOption;
  score: number;
  payoutType: SubsidyKey;
  payoutAmount: string;
  timestamp: string;
};

const SUBJECTS: SubjectOption[] = [
  "English",
  "Science",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Economics",
  "Technology"
];

const SUBSIDIES: Record<
  SubsidyKey,
  {
    icon: string;
    title: string;
    amount: string;
    description: string;
  }
> = {
  validation: {
    icon: "⛏️",
    title: "Knowledge Validation",
    amount: "0.0100 G",
    description: "Base learner payout for verified knowledge performance."
  },
  assessment: {
    icon: "🏆",
    title: "Protocol Assessment",
    amount: "0.0100 G",
    description: "Assessment reward for learners meeting the payout threshold."
  },
  pathway: {
    icon: "📚",
    title: "Pathway Mastery",
    amount: "0.00010 G",
    description: "Micro reward for pathway completion and mastery milestones."
  }
};

function formatWallet(address?: string) {
  if (!address) {
    return "Not Connected";
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function PayoutView() {
  const { address, isConnected } = useAccount();

  const [subject, setSubject] = useState<SubjectOption>("Science");
  const [score, setScore] = useState("80");
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(
    "Select a subject and confirm a score of at least 80% to request payout."
  );

  const numericScore = useMemo(() => {
    const parsed = Number.parseFloat(score);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [score]);

  const qualifies = numericScore >= 80 && numericScore <= 100;

  const payoutType = useMemo<SubsidyKey>(() => {
    if (numericScore >= 95) {
      return "assessment";
    }

    if (numericScore >= 80) {
      return "validation";
    }

    return "pathway";
  }, [numericScore]);

  const payoutAmount = SUBSIDIES[payoutType].amount;

  async function requestPayout() {
    if (!isConnected) {
      setStatus("Connect your wallet before requesting a payout.");
      return;
    }

    if (!qualifies) {
      setStatus("A payout can only be requested when the learner attains at least 80%.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Submitting payout request to the GENIUS Smart Contract...");

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const nextRecord: PayoutRecord = {
      subject,
      score: numericScore,
      payoutType,
      payoutAmount,
      timestamp: new Date().toLocaleString()
    };

    setPayoutHistory((current) => [nextRecord, ...current].slice(0, 6));
    setStatus(
      `Payout request created for ${subject} at ${numericScore}%. Eligible reward: ${payoutAmount}.`
    );
    setIsSubmitting(false);
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Rewards Payout
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">
          Smart Contract Reward Distribution
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-white/75">
          The GENIUS Smart Contract securely handles the GENIUS position and operates autonomously on
          the BNB Smart Chain. Its primary function is to directly payout deserving learners who meet
          the required parameters.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Wallet Status
            </div>
            <div className="mt-3 text-lg font-semibold text-white">
              {isConnected ? "BNB Identity Linked" : "Wallet Not Connected"}
            </div>
            <div className="mt-2 text-sm text-white/80">{formatWallet(address)}</div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Payout Requirements
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                📚 Select an Academic Subject
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                🏆 Attain a 80% Score on the Exam
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
              {qualifies
                ? "Eligibility met. The learner qualifies for payout request."
                : "Eligibility not met. Score must be between 80% and 100%."}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Payout Request
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-white">Academic Subject</div>
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value as SubjectOption)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  {SUBJECTS.map((item) => (
                    <option key={item} value={item} className="bg-slate-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-white">Exam Score (%)</div>
                <input
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
                  placeholder="80"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Payout Preview
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {SUBSIDIES[payoutType].title}
                </div>
                <div className="mt-2 text-3xl font-black text-cyan-100">{payoutAmount}</div>
                <div className="mt-2 text-sm text-white/70">
                  {SUBSIDIES[payoutType].description}
                </div>
              </div>

              <button
                type="button"
                onClick={requestPayout}
                disabled={!isConnected || !qualifies || isSubmitting}
                className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Payout Request..." : "Request Rewards Payout"}
              </button>
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
              Epoch 1 Subsidies
            </div>

            <div className="mt-4 space-y-3">
              {(Object.keys(SUBSIDIES) as SubsidyKey[]).map((key) => {
                const subsidy = SUBSIDIES[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{subsidy.icon}</div>
                        <div>
                          <div className="text-lg font-semibold text-white">{subsidy.title}</div>
                          <div className="mt-1 text-sm text-white/65">{subsidy.description}</div>
                        </div>
                      </div>
                      <div className="text-lg font-black text-cyan-100">{subsidy.amount}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Contract Status
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {status}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Recent Payout Requests
            </div>

            {payoutHistory.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
                No payout requests yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {payoutHistory.map((record, index) => (
                  <div
                    key={`${record.subject}-${record.timestamp}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">{record.subject}</div>
                        <div className="mt-1 text-sm text-white/65">
                          {record.score}% • {SUBSIDIES[record.payoutType].title}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-cyan-100">{record.payoutAmount}</div>
                        <div className="mt-1 text-xs text-white/50">{record.timestamp}</div>
                      </div>
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

