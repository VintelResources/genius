"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { awardGeniReward } from "@/lib/rewards";

const WordSchema = z.object({
  word: z.string().min(1),
  hint: z.string().min(1),
});

type GeneratedWord = z.infer<typeof WordSchema>;

type PuzzleRecord = {
  answer: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
  pendingStreak?: number;
  pendingMultiplier?: number;
  pendingRewardAmount?: string;
};

const CHALLENGE_DURATION_MS = 30_000;
const BASE_REWARD = 0.00000001;
const AI_COOLDOWN_MS = 5 * 60 * 1000;

const FALLBACK_WORDS: Record<string, GeneratedWord[]> = {
  beginner: [
    { word: "cat", hint: "A small pet that says meow." },
    { word: "sun", hint: "It shines in the sky during the day." },
    { word: "book", hint: "You read this." },
    { word: "fish", hint: "It swims in water." },
    { word: "tree", hint: "It grows from the ground and has leaves." }
  ],
  elementary: [
    { word: "garden", hint: "A place where flowers and vegetables grow." },
    { word: "window", hint: "You look through it to see outside." },
    { word: "blanket", hint: "You use it to keep warm in bed." },
    { word: "thunder", hint: "A loud sound during a storm." },
    { word: "library", hint: "A place with many books." }
  ],
  intermediate: [
    { word: "discover", hint: "To find something for the first time." },
    { word: "solution", hint: "The answer to a problem." },
    { word: "adventure", hint: "An exciting and unusual experience." },
    { word: "language", hint: "A system used to communicate with words." },
    { word: "journey", hint: "Travel from one place to another." }
  ],
  advanced: [
    { word: "architecture", hint: "The art and science of designing buildings." },
    { word: "innovation", hint: "A useful new idea, method, or device." },
    { word: "consequence", hint: "A result or effect of an action." },
    { word: "extraordinary", hint: "Very unusual or remarkable." },
    { word: "imagination", hint: "The ability to form ideas and pictures in the mind." }
  ]
};

const globalStore = globalThis as typeof globalThis & {
  __geniusPuzzles?: Map<string, PuzzleRecord>;
  __geniusStreaks?: Map<string, number>;
  __geniusAiCooldowns?: {
    geminiUntil: number;
    openaiUntil: number;
  };
};

const puzzles = globalStore.__geniusPuzzles ?? new Map<string, PuzzleRecord>();
const streaks = globalStore.__geniusStreaks ?? new Map<string, number>();
const aiCooldowns = globalStore.__geniusAiCooldowns ?? {
  geminiUntil: 0,
  openaiUntil: 0
};

globalStore.__geniusPuzzles = puzzles;
globalStore.__geniusStreaks = streaks;
globalStore.__geniusAiCooldowns = aiCooldowns;

function normalizeLevel(level: string): keyof typeof FALLBACK_WORDS {
  const value = level.trim().toLowerCase();
  if (value in FALLBACK_WORDS) return value as keyof typeof FALLBACK_WORDS;
  return "elementary";
}

function pickFallbackWord(level: string): GeneratedWord {
  const normalized = normalizeLevel(level);
  const pool = FALLBACK_WORDS[normalized];
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffleWord(word: string): string {
  if (word.length < 2) return word;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const chars = word.split("");

    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const shuffled = chars.join("");
    if (shuffled.toLowerCase() !== word.toLowerCase()) return shuffled;
  }

  return word.split("").reverse().join("");
}

function getPlayerKey(walletAddress?: `0x${string}`) {
  return walletAddress?.toLowerCase() ?? "guest";
}

function getMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function formatReward(amount: number): string {
  return amount.toFixed(8);
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyChallenge() {
  const date = getTodayIsoDate();
  const allWords = Object.values(FALLBACK_WORDS).flat();
  const seed = date.split("-").join("").split("").reduce((sum, digit) => sum + Number(digit), 0);
  const selected = allWords[seed % allWords.length];

  return {
    date,
    hint: selected.hint,
    jumbledWord: shuffleWord(selected.word)
  };
}

function createPuzzle(word: GeneratedWord, source: "gemini" | "openai" | "fallback", message?: string) {
  const now = Date.now();
  const puzzleId = randomUUID();

  puzzles.set(puzzleId, {
    answer: word.word.trim().toLowerCase(),
    createdAt: now,
    expiresAt: now + CHALLENGE_DURATION_MS,
    verified: false
  });

  return {
    ok: true,
    source,
    puzzleId,
    expiresAt: now + CHALLENGE_DURATION_MS,
    data: {
      hint: word.hint,
      jumbledWord: shuffleWord(word.word)
    },
    message
  };
}

function cleanupPuzzles() {
  const now = Date.now();

  for (const [id, record] of puzzles.entries()) {
    if (record.expiresAt <= now) {
      puzzles.delete(id);
    }
  }
}

function isQuotaError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("quota") ||
    message.includes("insufficient_quota") ||
    message.includes("rate limit") ||
    message.includes("free_tier_requests") ||
    message.includes("429")
  );
}

function providerCoolingDown(provider: "gemini" | "openai"): boolean {
  const now = Date.now();
  return provider === "gemini"
    ? aiCooldowns.geminiUntil > now
    : aiCooldowns.openaiUntil > now;
}

function startCooldown(provider: "gemini" | "openai") {
  const until = Date.now() + AI_COOLDOWN_MS;

  if (provider === "gemini") {
    aiCooldowns.geminiUntil = until;
  } else {
    aiCooldowns.openaiUntil = until;
  }
}

async function generateWordWithGemini(level: string): Promise<GeneratedWord> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  }

  const google = createGoogleGenerativeAI({
    apiKey
  });

  const { object: output } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: WordSchema,
    maxRetries: 0,
    prompt: `Generate exactly one classroom-safe spelling word and one short hint for a ${level} student.`
  });

  return output;
}

async function generateWordWithOpenAI(level: string): Promise<GeneratedWord> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const google = createGoogleGenerativeAI({
    apiKey
  });

  const openai = createOpenAI({
    apiKey
  });

  const { object: output } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: WordSchema,
    maxRetries: 0,
    prompt: `Generate exactly one classroom-safe spelling word and one short hint for a ${level} student.`
  });

  return output;
}

export async function getDailyChallengeData() {
  return getDailyChallenge();
}

export async function getServerStreak(walletAddress?: `0x${string}`) {
  const playerKey = getPlayerKey(walletAddress);
  const streak = streaks.get(playerKey) ?? 0;

  return {
    streak,
    multiplier: getMultiplier(streak),
    projectedReward: formatReward(BASE_REWARD * getMultiplier(streak))
  };
}

export async function generateNewWord(level: string) {
  cleanupPuzzles();

  const normalizedLevel = normalizeLevel(level);

  if (!providerCoolingDown("gemini")) {
    try {
      const geminiWord = await generateWordWithGemini(normalizedLevel);
      return createPuzzle(geminiWord, "gemini", "Loaded from Gemini.");
    } catch (geminiError) {
      console.error("Gemini generation failed:", geminiError);

      if (isQuotaError(geminiError)) {
        startCooldown("gemini");
      }
    }
  }

  if (!providerCoolingDown("openai")) {
    try {
      const openAiWord = await generateWordWithOpenAI(normalizedLevel);
      return createPuzzle(openAiWord, "openai", "Loaded from OpenAI fallback.");
    } catch (openAiError) {
      console.error("OpenAI fallback failed:", openAiError);

      if (isQuotaError(openAiError)) {
        startCooldown("openai");
      }
    }
  }

  return createPuzzle(
    pickFallbackWord(normalizedLevel),
    "fallback",
    "AI temporarily unavailable. Using fast local challenge mode."
  );
}

export async function submitPuzzleAnswer(input: {
  puzzleId: string;
  guess: string;
  walletAddress?: `0x${string}`;
}) {
  const puzzle = puzzles.get(input.puzzleId);
  const playerKey = getPlayerKey(input.walletAddress);

  if (!puzzle) {
    return {
      ok: false,
      correct: false,
      message: "Puzzle expired. Generate a new one."
    };
  }

  if (Date.now() > puzzle.expiresAt) {
    puzzles.delete(input.puzzleId);
    streaks.set(playerKey, 0);

    return {
      ok: false,
      correct: false,
      expired: true,
      streak: 0,
      multiplier: 1,
      message: "Time is up. Generate a new challenge."
    };
  }

  const normalizedGuess = input.guess.trim().toLowerCase();

  if (!normalizedGuess) {
    return {
      ok: false,
      correct: false,
      message: "Enter an answer first."
    };
  }

  if (normalizedGuess !== puzzle.answer) {
    streaks.set(playerKey, 0);

    return {
      ok: true,
      correct: false,
      streak: 0,
      multiplier: 1,
      message: "Not quite. Try again."
    };
  }

  const nextStreak = (streaks.get(playerKey) ?? 0) + 1;
  const multiplier = getMultiplier(nextStreak);
  const rewardAmount = formatReward(BASE_REWARD * multiplier);

  puzzle.verified = true;
  puzzle.pendingStreak = nextStreak;
  puzzle.pendingMultiplier = multiplier;
  puzzle.pendingRewardAmount = rewardAmount;
  puzzles.set(input.puzzleId, puzzle);

  return {
    ok: true,
    correct: true,
    rewarded: false,
    streak: nextStreak,
    multiplier,
    rewardAmount,
    message: `Correct answer confirmed. Claim ${rewardAmount} GENI.`
  };
}

export async function claimPuzzleReward(input: {
  puzzleId: string;
  walletAddress: `0x${string}`;
}) {
  const puzzle = puzzles.get(input.puzzleId);
  const playerKey = getPlayerKey(input.walletAddress);

  if (!puzzle) {
    return {
      ok: false,
      rewarded: false,
      message: "This reward is no longer available. Generate a new challenge."
    };
  }

  if (!puzzle.verified || !puzzle.pendingRewardAmount || !puzzle.pendingStreak || !puzzle.pendingMultiplier) {
    return {
      ok: false,
      rewarded: false,
      message: "Answer has not been verified yet."
    };
  }

  if (Date.now() > puzzle.expiresAt) {
    puzzles.delete(input.puzzleId);
    streaks.set(playerKey, 0);

    return {
      ok: false,
      rewarded: false,
      expired: true,
      message: "Reward window expired. Generate a new challenge."
    };
  }

  try {
    const reward = await awardGeniReward(input.walletAddress, puzzle.pendingRewardAmount);

    streaks.set(playerKey, puzzle.pendingStreak);
    puzzles.delete(input.puzzleId);

    return {
      ok: true,
      correct: true,
      rewarded: true,
      streak: puzzle.pendingStreak,
      multiplier: puzzle.pendingMultiplier,
      rewardAmount: puzzle.pendingRewardAmount,
      reward,
      message: `Correct. Reward sent: ${reward.humanAmount} GENI. Tx: ${reward.hash}`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reward transfer failed";

    return {
      ok: false,
      rewarded: false,
      message: `Reward transfer failed: ${message}`
    };
  }
}




