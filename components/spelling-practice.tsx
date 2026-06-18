"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import {
  claimPuzzleReward,
  generateNewWord,
  getDailyChallengeData,
  getServerStreak,
  submitPuzzleAnswer
} from "@/actions/aiGenerator";

type PuzzleResponse = {
  ok: boolean;
  source: "gemini" | "fallback";
  puzzleId: string;
  expiresAt: number;
  data: {
    hint: string;
    jumbledWord: string;
  };
  message?: string;
};

type SubmitResponse = {
  ok: boolean;
  correct: boolean;
  rewarded?: boolean;
  expired?: boolean;
  message?: string;
  streak?: number;
  multiplier?: number;
  rewardAmount?: string;
  reward?: {
    hash: string;
    status: string;
    humanAmount: string;
  };
};

type DailyChallenge = {
  date: string;
  hint: string;
  jumbledWord: string;
};

type PendingReward = {
  puzzleId: string;
  guess: string;
  streak?: number;
  multiplier?: number;
  rewardAmount?: string;
  message?: string;
};

const LEVELS = ["beginner", "elementary", "intermediate", "advanced"] as const;
const BASE_REWARD = 0.00000001;

type SpellingPracticeProps = {
  onRewarded: () => void;
};

function getMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function formatReward(value: number): string {
  return value.toFixed(8);
}

function playTone(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume = 0.05
) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function getDisplayName(address?: string) {
  if (!address) return "Guest";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function updateLocalLeaderboard(address: string | undefined, rewardAmount: string, nextStreak: number) {
  const name = getDisplayName(address);
  const existing = window.localStorage.getItem("genius_leaderboard");
  const parsed = existing ? JSON.parse(existing) : [];

  const current = parsed.find((entry: any) => entry.name === name);

  if (current) {
    current.correct += 1;
    current.bestStreak = Math.max(current.bestStreak, nextStreak);
    current.totalEarned = Number((current.totalEarned + Number(rewardAmount)).toFixed(8));
    current.updatedAt = Date.now();
  } else {
    parsed.push({
      name,
      correct: 1,
      bestStreak: nextStreak,
      totalEarned: Number(rewardAmount),
      updatedAt: Date.now()
    });
  }

  parsed.sort((a: any, b: any) => {
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    return b.totalEarned - a.totalEarned;
  });

  window.localStorage.setItem("genius_leaderboard", JSON.stringify(parsed.slice(0, 10)));
}

export function SpellingPractice({ onRewarded }: SpellingPracticeProps) {
  const { address, isConnected } = useAccount();

  const [level, setLevel] = useState<(typeof LEVELS)[number]>("elementary");
  const [puzzleId, setPuzzleId] = useState("");
  const [hint, setHint] = useState("");
  const [jumbledWord, setJumbledWord] = useState("");
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerPaused, setTimerPaused] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showCombo, setShowCombo] = useState("");
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyOpened, setDailyOpened] = useState(false);

  const [pendingReward, setPendingReward] = useState<PendingReward | null>(null);
  const [claimedReward, setClaimedReward] = useState<SubmitResponse | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const [prefetchedPuzzle, setPrefetchedPuzzle] = useState<PuzzleResponse | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedStreak = Number(window.localStorage.getItem("genius_streak") || "0");
    const savedBestStreak = Number(window.localStorage.getItem("genius_best_streak") || "0");
    const savedCorrectCount = Number(window.localStorage.getItem("genius_correct_count") || "0");
    const savedWrongCount = Number(window.localStorage.getItem("genius_wrong_count") || "0");

    setStreak(savedStreak);
    setBestStreak(savedBestStreak);
    setCorrectCount(savedCorrectCount);
    setWrongCount(savedWrongCount);

    void getDailyChallengeData().then((data) => setDailyChallenge(data));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("genius_streak", String(streak));
  }, [streak]);

  useEffect(() => {
    window.localStorage.setItem("genius_best_streak", String(bestStreak));
  }, [bestStreak]);

  useEffect(() => {
    window.localStorage.setItem("genius_correct_count", String(correctCount));
  }, [correctCount]);

  useEffect(() => {
    window.localStorage.setItem("genius_wrong_count", String(wrongCount));
  }, [wrongCount]);

  useEffect(() => {
    void getServerStreak(address).then((data) => {
      setStreak(data.streak);
    });
  }, [address]);

  useEffect(() => {
    if (!expiresAt || !puzzleId || timerPaused) return;

    const updateTimer = () => {
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(seconds);
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(interval);
  }, [expiresAt, puzzleId, timerPaused]);

  useEffect(() => {
    if (!puzzleId || timerPaused) return;
    if (timeLeft > 0) return;

    setFeedback("Time is up. Streak reset. Generate a new challenge.");
    clearPuzzle();
    setStreak(0);
    setWrongCount((value) => value + 1);
    triggerWrongEffects();
    void prefetchNextPuzzle(level);
  }, [timeLeft, puzzleId, timerPaused, level]);

  const currentMultiplier = useMemo(() => getMultiplier(streak), [streak]);
  const projectedReward = useMemo(
    () => formatReward(BASE_REWARD * currentMultiplier),
    [currentMultiplier]
  );

  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    return audioContextRef.current;
  }

  function triggerCorrectEffects(nextStreak: number) {
    const audioContext = getAudioContext();

    playTone(audioContext, 523.25, 0.12, "triangle", 0.05);
    window.setTimeout(() => playTone(audioContext, 659.25, 0.12, "triangle", 0.05), 90);
    window.setTimeout(() => playTone(audioContext, 783.99, 0.18, "triangle", 0.06), 180);

    setShowCorrectFlash(true);
    window.setTimeout(() => setShowCorrectFlash(false), 800);

    const multiplier = getMultiplier(nextStreak);
    if (multiplier > 1) {
      setShowCombo(`Combo x${multiplier}`);
      window.setTimeout(() => setShowCombo(""), 1800);
    }
  }

  function triggerWrongEffects() {
    const audioContext = getAudioContext();

    playTone(audioContext, 240, 0.18, "sawtooth", 0.04);
    window.setTimeout(() => playTone(audioContext, 180, 0.22, "sawtooth", 0.04), 120);

    setShowWrongFlash(true);
    window.setTimeout(() => setShowWrongFlash(false), 700);
    setShowCombo("");
  }

  function loadPuzzle(response: PuzzleResponse) {
    setPuzzleId(response.puzzleId);
    setHint(response.data.hint);
    setJumbledWord(response.data.jumbledWord);
    setExpiresAt(response.expiresAt);
    setTimeLeft(Math.max(0, Math.ceil((response.expiresAt - Date.now()) / 1000)));
    setTimerPaused(false);
    setStatus(response.message || `Loaded from ${response.source}.`);
    setError("");
    setFeedback("");
    setGuess("");
  }

  function clearPuzzle() {
    setPuzzleId("");
    setHint("");
    setJumbledWord("");
    setGuess("");
    setExpiresAt(null);
    setTimeLeft(30);
    setTimerPaused(false);
  }

  async function prefetchNextPuzzle(currentLevel: string) {
    if (isPrefetching) return;

    try {
      setIsPrefetching(true);
      const next = (await generateNewWord(currentLevel)) as PuzzleResponse;
      if (next?.puzzleId && next?.data?.hint && next?.data?.jumbledWord) {
        setPrefetchedPuzzle(next);
      }
    } catch {
    } finally {
      setIsPrefetching(false);
    }
  }

  const handleGenerate = () => {
    startTransition(async () => {
      setStatus("Generating puzzle...");
      setError("");
      setFeedback("");
      setPendingReward(null);
      setClaimedReward(null);

      if (prefetchedPuzzle) {
        const next = prefetchedPuzzle;
        setPrefetchedPuzzle(null);
        loadPuzzle(next);
        void prefetchNextPuzzle(level);
        return;
      }

      clearPuzzle();

      try {
        const response = (await generateNewWord(level)) as PuzzleResponse;

        if (!response?.data?.jumbledWord || !response?.data?.hint || !response?.puzzleId) {
          setStatus("");
          setError("No puzzle was returned from the generator.");
          return;
        }

        loadPuzzle(response);
        void prefetchNextPuzzle(level);
      } catch (err) {
        setStatus("");
        setError(err instanceof Error ? err.message : "Failed to generate puzzle.");
      }
    });
  };

  const handleSubmit = () => {
    if (!puzzleId) {
      setError("Generate a puzzle first.");
      return;
    }

    if (timeLeft <= 0) {
      setError("Time is up. Generate a new challenge.");
      return;
    }

    startTransition(async () => {
      setError("");
      setFeedback("");

      try {
        const response = (await submitPuzzleAnswer({
          puzzleId,
          guess,
          walletAddress: address
        })) as SubmitResponse;

        if (!response.ok && response.message) {
          setError(response.message);
          if (response.expired) {
            setStreak(0);
            setWrongCount((value) => value + 1);
            triggerWrongEffects();
          }
          return;
        }

        if (response.correct) {
          setTimerPaused(true);
          setPendingReward({
            puzzleId,
            guess,
            streak: response.streak,
            multiplier: response.multiplier,
            rewardAmount: response.rewardAmount,
            message: response.message
          });

          triggerCorrectEffects(response.streak ?? streak + 1);
          return;
        }

        setFeedback(response.message || "");
        setWrongCount((value) => value + 1);
        setStreak(0);
        triggerWrongEffects();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit answer.");
      }
    });
  };

  const handleClaimReward = () => {
    if (!pendingReward) return;

    if (!address) {
      setError("Connect your wallet first to claim GENI.");
      return;
    }

    setIsClaiming(true);

    startTransition(async () => {
      try {
        const response = (await claimPuzzleReward({
          puzzleId: pendingReward.puzzleId,
          walletAddress: address
        })) as SubmitResponse;

        if (!response.ok && response.message) {
          setError(response.message);
          setIsClaiming(false);
          return;
        }

        const nextStreak = response.streak ?? pendingReward.streak ?? streak + 1;
        const rewardAmount = response.rewardAmount ?? pendingReward.rewardAmount ?? projectedReward;

        setCorrectCount((value) => value + 1);
        setStreak(nextStreak);
        setBestStreak((value) => Math.max(value, nextStreak));
        setFeedback(response.message || `Reward sent: ${rewardAmount} GENI`);
        updateLocalLeaderboard(address, rewardAmount, nextStreak);

        setClaimedReward({
          ...response,
          rewardAmount
        });
        setPendingReward(null);
        setIsClaiming(false);
        clearPuzzle();
        onRewarded();
        void prefetchNextPuzzle(level);
      } catch (err) {
        setIsClaiming(false);
        setError(err instanceof Error ? err.message : "Failed to claim reward.");
      }
    });
  };

  const handleStartNextChallenge = () => {
    setClaimedReward(null);
    handleGenerate();
  };

  const timerColor =
    timeLeft <= 5 ? "text-red-300" :
    timeLeft <= 10 ? "text-amber-200" :
    "text-cyan-200";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur-xl">
      {showCorrectFlash ? <div className="absolute inset-0 animate-correctFlash bg-cyan-400/20" /> : null}
      {showWrongFlash ? <div className="absolute inset-0 animate-wrongFlash bg-red-500/20" /> : null}

      {pendingReward ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-fuchsia-300/20 bg-[#0b1025] p-6 text-center shadow-2xl">
            <div className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/80">Victory</div>
            <h2 className="mt-3 bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-4xl font-black text-transparent">
              YOU ARE A GENIUS!!
            </h2>
            <p className="mt-4 text-white/80">Correct answer confirmed.</p>
            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Reward Ready</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {pendingReward.rewardAmount ?? projectedReward} GENI
              </div>
            </div>
            <div className="mt-3 text-sm text-white/70">
              Countdown paused while you claim your reward.
            </div>
            {!isConnected ? (
              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Connect your wallet, then claim your reward.
              </div>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingReward(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleClaimReward}
                disabled={isClaiming || !isConnected}
                className="flex-1 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {isClaiming ? "Paying..." : "Claim Reward"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {claimedReward ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-emerald-300/20 bg-[#0b1025] p-6 text-center shadow-2xl">
            <div className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Reward Added</div>
            <h2 className="mt-3 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-4xl font-black text-transparent">
              BALANCE UPDATED
            </h2>
            <p className="mt-4 text-white/80">
              Your GENI reward has been added to your wallet balance.
            </p>
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Paid Out</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {claimedReward.rewardAmount ?? "0.00000001"} GENI
              </div>
              {claimedReward.reward?.hash ? (
                <div className="mt-3 break-all text-xs text-white/65">
                  Tx: {claimedReward.reward.hash}
                </div>
              ) : null}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setClaimedReward(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={handleStartNextChallenge}
                className="flex-1 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white"
              >
                Start Next Challenge
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute -left-16 top-[-40px] h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-[-40px] h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

      {showCombo ? (
        <div className="pointer-events-none absolute right-4 top-4 z-20 animate-comboPop rounded-full border border-fuchsia-300/20 bg-fuchsia-400/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-200">
          {showCombo}
        </div>
      ) : null}

      <div className="relative z-10 space-y-5">
        <div className="space-y-1">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Genius Web
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            AI Spelling Lab
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            Unscramble the jumbled word using only the hint. Correct answers earn streak-scaled GENI.
          </p>
        </div>

        {dailyChallenge ? (
          <div className="rounded-2xl border border-lime-300/20 bg-lime-400/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-lime-200/80">Daily Challenge</div>
                <div className="mt-1 text-sm text-white/75">{dailyChallenge.date}</div>
              </div>
              <button
                type="button"
                onClick={() => setDailyOpened((value) => !value)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85"
              >
                {dailyOpened ? "Hide" : "Show"}
              </button>
            </div>

            {dailyOpened ? (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-white/80">
                  <span className="font-semibold text-white">Hint:</span> {dailyChallenge.hint}
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl font-bold uppercase tracking-[0.2em] text-lime-200">
                  {dailyChallenge.jumbledWord}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Streak</div>
            <div className="mt-2 text-3xl font-black text-white">{streak}</div>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/80">Best</div>
            <div className="mt-2 text-3xl font-black text-white">{bestStreak}</div>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Correct</div>
            <div className="mt-2 text-3xl font-black text-white">{correctCount}</div>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Next Reward</div>
            <div className="mt-2 text-xl font-black text-white">{projectedReward} GENI</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
            disabled={isPending}
            className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none backdrop-blur-md"
          >
            {LEVELS.map((item) => (
              <option key={item} value={item} className="text-black">
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] transition duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Working..." : prefetchedPuzzle ? "Start Instant Puzzle" : "Generate Puzzle"}
          </button>
        </div>

        {puzzleId ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                Challenge Timer
              </div>
              {timerPaused ? (
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                  Paused
                </div>
              ) : null}
            </div>
            <div className={`text-center text-5xl font-black ${timerColor}`}>
              {timeLeft}s
            </div>
          </div>
        ) : null}

        {!isConnected ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Connect your wallet to receive GENI rewards after correct answers.
          </div>
        ) : null}

        {status ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {status}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur-md">
          {isPending && !jumbledWord ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-10 w-48 rounded bg-white/10" />
              <div className="h-4 w-64 rounded bg-white/10" />
            </div>
          ) : jumbledWord ? (
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                Unscramble Challenge
              </div>

              <p className="text-base text-white/80">
                <span className="font-semibold text-white">Hint:</span> {hint}
              </p>

              <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-5 text-center">
                <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/80">
                  Jumbled Word
                </div>
                <div className="mt-2 animate-wordPulse bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-4xl font-bold uppercase tracking-[0.2em] text-transparent sm:text-6xl">
                  {jumbledWord}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type your answer"
                  className="flex-1 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending || !puzzleId || !guess.trim() || timeLeft <= 0 || Boolean(pendingReward) || Boolean(claimedReward)}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>

              {feedback ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
                  {feedback}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center text-white/50">
              No puzzle loaded yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

