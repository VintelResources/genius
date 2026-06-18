"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import CurriculumTabs from "@/components/curriculum-tabs";
import CoursesView from "@/components/courses-view";
import ExamCatalogView from "@/components/exam-catalog-view";
import FoundationView from "@/components/foundation-view";
import LeaderboardView from "@/components/leaderboard-view";
import PayoutView from "@/components/payout-view";
import ReferralsView from "@/components/referrals-view";
import TokenomicsView from "@/components/tokenomics-view";
import LanguagesView from "@/components/languages-view";
import TriviaTab from "@/components/trivia-tab";
import WalletView from "@/components/wallet-view";
import { SHELL_TABS, type ShellTabKey } from "@/lib/app-shell-tabs";

type LearnerProfile = {
  email: string;
  displayName: string;
  learnerBand: "toddlers" | "primary" | "secondary" | "tertiary";
};

const PROFILE_STORAGE_KEY = "lumina_profile";
const ACTIVE_TAB_STORAGE_KEY = "lumina_active_tab";
const DEVELOPER_EMAILS = ["your-email@example.com"];

function EmptyPanel({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="fg-card p-5 lg:p-6">
      <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">{title}</div>
      <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm text-white/70">{description}</p>
      <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-100">
        Shell ready. We can wire this tab next.
      </div>
    </section>
  );
}

function AuthGate({
  onContinue
}: {
  onContinue: (profile: LearnerProfile) => void;
}) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [learnerBand, setLearnerBand] =
    useState<LearnerProfile["learnerBand"]>("toddlers");

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleContinue() {
    const safeEmail = email.trim();
    const safeDisplayName = displayName.trim() || "Learner";

    if (!safeEmail) {
      return;
    }

    onContinue({
      email: safeEmail,
      displayName: safeDisplayName,
      learnerBand
    });
  }

  return (
    <main className="relative min-h-screen pb-16 pt-8">
      <div className="fg-shell">
        <section className="fg-hero fg-neon-ring mb-6 overflow-hidden px-6 py-7 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="fg-chip">GENIUS WEB Ã¢â‚¬Â¢ 4K FUTURE UI</div>
              <h1 className="fg-title mt-4">Little Genius Protocol</h1>
              <p className="fg-subtitle mt-4">
                A next-generation adaptive learning ecosystem where AI tutors, intelligent exams,
                futuristic interfaces, and wallet-based rewards converge into one powerful platform.
              </p>
            </div>
            <div className="fg-logo-frame">
              <img src="/genius-logo.png" alt="Little Genius logo" className="logo-spin-slow logo-spin-slow-glow" />
            </div>
          </div>
        </section>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_28%)]" />
      <div className="relative z-10 fg-shell space-y-6">
        <section className="fg-card-strong p-6 lg:p-8">
          <div className="fg-chip">
            Genius Web
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">AI Studio Shell Patch</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Auth gate, top tabs, saved learner profile, and curriculum mounted inside the new shell.
          </p>
        </section>

        <div className="fg-grid gap-6">
          <section className="fg-card p-5 lg:p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Learner Login
            </div>

            <div className="mt-4 space-y-4">
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                className="fg-button-secondary w-full px-4 py-3 text-sm"
              />

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="fg-button-secondary w-full px-4 py-3 text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                {(["toddlers", "primary", "secondary", "tertiary"] as const).map((band) => {
                  const active = learnerBand === band;

                  return (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setLearnerBand(band)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                          : "border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      {band.charAt(0).toUpperCase() + band.slice(1)}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!email.trim()}
                className="fg-button-secondary w-full px-4 py-3 text-sm"
              >
                Continue into App
              </button>
            </div>
          </section>

          <section className="fg-card p-5 lg:p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Wallet Connect
            </div>

            <div className="mt-4 space-y-3">
              {!mounted ? (
                <div className="fg-panel">
                  Loading wallet connectors...
                </div>
              ) : (
                connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    type="button"
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="fg-button-secondary w-full px-4 py-3 text-sm"
                  >
                    Connect {connector.name}
                  </button>
                ))
              )}

              <div className="fg-panel">
                {mounted && isConnected ? `Connected wallet: ${address}` : "No wallet connected yet."}
              </div>

              {mounted && isConnected ? (
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="fg-button-secondary w-full px-4 py-3 text-sm"
                >
                  Disconnect Wallet
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function AppShell() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ShellTabKey>("lessons");

  useEffect(() => {
    setMounted(true);

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const storedTab = window.localStorage.getItem(
        ACTIVE_TAB_STORAGE_KEY
      ) as ShellTabKey | null;

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as LearnerProfile);
      }

      if (storedTab) {
        setActiveTab(storedTab);
      }
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !profile) {
      return;
    }

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );
  }, [mounted, profile]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(
      ACTIVE_TAB_STORAGE_KEY,
      activeTab
    );
  }, [mounted, activeTab]);

  const isDeveloper = useMemo(() => {
    const email = profile?.email?.trim().toLowerCase() ?? "";
    return DEVELOPER_EMAILS.includes(email);
  }, [profile]);

  const visibleTabs = useMemo(() => {
    return SHELL_TABS.filter((tab) => {
      if (tab.key === "admin") {
        return isDeveloper;
      }

      return true;
    });
  }, [isDeveloper]);

  useEffect(() => {
    function handleOpenWallet() {
      setActiveTab("wallet");
    }

    window.addEventListener(
      "geni-open-wallet",
      handleOpenWallet
    );

    return () => {
      window.removeEventListener(
        "geni-open-wallet",
        handleOpenWallet
      );
    };
  }, []);

  useEffect(() => {
    if (!isDeveloper && activeTab === "admin") {
      setActiveTab("lessons");
    }
  }, [isDeveloper, activeTab]);

  const activeTabMeta = useMemo(
  () =>
    visibleTabs.find(
      (tab) => tab.key === activeTab
    ) ?? visibleTabs[0],
  [activeTab, visibleTabs]
);

if (!mounted) {
  return (
      <main className="relative min-h-screen pb-16 pt-8">
      <div className="fg-shell">
        <section className="fg-hero fg-neon-ring mb-6 overflow-hidden px-6 py-7 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="fg-chip">GENIUS WEB Ã¢â‚¬Â¢ 4K FUTURE UI</div>
              <h1 className="fg-title mt-4">Little Genius Protocol</h1>
              <p className="fg-subtitle mt-4">
                A next-generation adaptive learning ecosystem where AI tutors, intelligent exams,
                futuristic interfaces, and wallet-based rewards converge into one powerful platform.
              </p>
            </div>
            <div className="fg-logo-frame">
              <img src="/genius-logo.png" alt="Little Genius logo" className="logo-spin-slow logo-spin-slow-glow" />
            </div>
          </div>
        </section>
      </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_28%)]" />
        <div className="relative z-10 fg-shell space-y-6">
          <section className="rounded-[30px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-sm text-white/70">Loading app shell...</div>
          </section>
        </div>
      </main>
    );
  }

  if (!profile) {
    return <AuthGate onContinue={setProfile} />;
  }

  return (
    <main className="relative min-h-screen pb-16 pt-8">
      <div className="fg-shell">
        <section className="fg-hero fg-neon-ring mb-6 overflow-hidden px-6 py-7 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="fg-chip">GENIUS WEB Ã¢â‚¬Â¢ 4K FUTURE UI</div>
              <h1 className="fg-title mt-4">Little Genius Protocol</h1>
              <p className="fg-subtitle mt-4">
                A next-generation adaptive learning ecosystem where AI tutors, intelligent exams,
                futuristic interfaces, and wallet-based rewards converge into one powerful platform.
              </p>
            </div>
            <div className="fg-logo-frame">
              <img src="/genius-logo.png" alt="Little Genius logo" className="logo-spin-slow logo-spin-slow-glow" />
            </div>
          </div>
        </section>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_28%)]" />

      <div className="relative z-10 fg-shell space-y-6">
        <section className="rounded-[30px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="fg-chip">
                Genius Web Shell
              </div>
              <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
                Welcome, {profile.displayName}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {profile.email} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {profile.learnerBand}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem(PROFILE_STORAGE_KEY);
                window.localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
                setProfile(null);
                setActiveTab("lessons");
              }}
              className="fg-panel"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {visibleTabs.map((tab) => {
              const active = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "trivia" ? <TriviaTab /> : null}
        {activeTab === "lessons" && typeof CoursesView === "function" ? <CoursesView /> : null}
        {activeTab === "paths" && typeof CurriculumTabs === "function" ? (
          <CurriculumTabs title="Learning Paths" subtitle="Structured Category Paths" />
        ) : null}
        {activeTab === "exam" && typeof ExamCatalogView === "function" ? <ExamCatalogView /> : null}
        {activeTab === "foundation" && typeof FoundationView === "function" ? <FoundationView /> : null}
        {activeTab === "tokenomics" && typeof TokenomicsView === "function" ? <TokenomicsView /> : null}
        {activeTab === "languages" && typeof LanguagesView === "function" ? <LanguagesView /> : null}
        {activeTab === "wallet" && typeof WalletView === "function" ? <WalletView /> : null}
        {activeTab === "payout" && typeof PayoutView === "function" ? <PayoutView /> : null}
        {activeTab === "leaderboard" && typeof LeaderboardView === "function" ? <LeaderboardView /> : null}
        {activeTab === "referrals" && typeof ReferralsView === "function" ? <ReferralsView /> : null}

        {(
          
          (activeTab === "lessons" && typeof CoursesView !== "function") ||
          (activeTab === "paths" && typeof CurriculumTabs !== "function") ||
          (activeTab === "exam" && typeof ExamCatalogView !== "function") ||
          (activeTab === "foundation" && typeof FoundationView !== "function") ||
          (activeTab === "tokenomics" && typeof TokenomicsView !== "function") ||
          (activeTab === "languages" && typeof LanguagesView !== "function") ||
          (activeTab === "wallet" && typeof WalletView !== "function") ||
          (activeTab === "payout" && typeof PayoutView !== "function") ||
          (activeTab === "leaderboard" && typeof LeaderboardView !== "function") ||
          (activeTab === "referrals" && typeof ReferralsView !== "function")
        ) ? (
          <EmptyPanel
            title="Import Error"
            description={`The ${activeTab} tab is imported as an object instead of a React component. Check default vs named export for this file.`}
          />
        ) : null}
        {activeTab === "admin" && isDeveloper ? (
          <EmptyPanel
            title="Admin"
            description="This shell tab is ready for moderation, treasury controls, content management, and ops tools."
          />
        ) : null}

        <section className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/75">
          Active tab: <span className="font-semibold text-white">{activeTabMeta?.label ?? "Shell"}</span>
          {activeTabMeta ? ` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ${activeTabMeta.description}` : ""}
        </section>
      </div>
    </main>
  );
}












