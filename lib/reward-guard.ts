import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getRewardConfig } from "@/lib/server-env";

type LearnerAddress = `0x${string}` | undefined;

type TriviaSessionRecord = {
  sessionId: string;
  walletAddress: string;
  categoryTitle: string;
  createdAt: number;
  claimed: boolean;
};

type ExamClaimRecord = {
  claimKey: string;
  walletAddress: string;
  courseId: string;
  lessonId: string;
  createdAt: number;
};

type LearnerHistoryEntry = {
  type: "trivia-session" | "trivia-claim" | "exam-claim";
  walletAddress: string;
  createdAt: number;
  details: Record<string, unknown>;
};

const globalStore = globalThis as typeof globalThis & {
  __rewardGuardTriviaSessions?: Map<string, TriviaSessionRecord>;
  __rewardGuardExamClaims?: Map<string, ExamClaimRecord>;
  __rewardGuardLearnerHistory?: Map<string, LearnerHistoryEntry[]>;
};

const triviaSessions = globalStore.__rewardGuardTriviaSessions ?? new Map<string, TriviaSessionRecord>();
const examClaims = globalStore.__rewardGuardExamClaims ?? new Map<string, ExamClaimRecord>();
const learnerHistory = globalStore.__rewardGuardLearnerHistory ?? new Map<string, LearnerHistoryEntry[]>();

globalStore.__rewardGuardTriviaSessions = triviaSessions;
globalStore.__rewardGuardExamClaims = examClaims;
globalStore.__rewardGuardLearnerHistory = learnerHistory;

function normalizeWalletAddress(walletAddress: LearnerAddress) {
  return walletAddress?.toLowerCase() ?? "guest";
}

function getLogPath() {
  return path.join(process.cwd(), "data", "reward-claims.log");
}

async function appendLog(entry: Record<string, unknown>) {
  try {
    await mkdir(path.join(process.cwd(), "data"), { recursive: true });
    await appendFile(getLogPath(), `${JSON.stringify(entry)}\n`, "utf8");
  } catch {}
}

function pushLearnerHistory(walletAddress: LearnerAddress, entry: LearnerHistoryEntry) {
  const key = normalizeWalletAddress(walletAddress);
  const current = learnerHistory.get(key) ?? [];
  current.unshift(entry);
  learnerHistory.set(key, current.slice(0, 100));
}

export function createServerTriviaSession(input: {
  walletAddress?: `0x${string}`;
  categoryTitle: string;
}) {
  const rewardConfig = getRewardConfig();
  const walletKey = normalizeWalletAddress(input.walletAddress);
  const now = Date.now();

  const recentSessionCount = Array.from(triviaSessions.values()).filter(
    (session) =>
      session.walletAddress === walletKey &&
      now - session.createdAt <= rewardConfig.triviaRateLimitWindowMs
  ).length;

  if (recentSessionCount >= rewardConfig.triviaRateLimitMaxSessions) {
    return {
      ok: false as const,
      message: `Too many trivia sessions. Please wait before starting another one.`
    };
  }

  const sessionId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `trivia-${now}-${Math.random().toString(36).slice(2, 10)}`;

  const sessionRecord: TriviaSessionRecord = {
    sessionId,
    walletAddress: walletKey,
    categoryTitle: input.categoryTitle,
    createdAt: now,
    claimed: false
  };

  triviaSessions.set(sessionId, sessionRecord);
  pushLearnerHistory(input.walletAddress, {
    type: "trivia-session",
    walletAddress: walletKey,
    createdAt: now,
    details: {
      sessionId,
      categoryTitle: input.categoryTitle
    }
  });

  return {
    ok: true as const,
    sessionId
  };
}

export function validateTriviaClaim(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
}) {
  const session = triviaSessions.get(input.sessionId);
  const walletKey = normalizeWalletAddress(input.walletAddress);

  if (!session) {
    return {
      ok: false as const,
      message: "Trivia session not found or expired."
    };
  }

  if (session.walletAddress !== walletKey) {
    return {
      ok: false as const,
      message: "This trivia reward does not belong to the connected wallet."
    };
  }

  if (session.claimed) {
    return {
      ok: false as const,
      message: "Trivia reward already claimed for this session."
    };
  }

  return {
    ok: true as const,
    session
  };
}

export async function markTriviaClaimed(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
  rewardAmount: string;
  correctAnswers: number;
  totalQuestions: number;
  categoryTitle: string;
  txHash?: string;
}) {
  const session = triviaSessions.get(input.sessionId);

  if (session) {
    triviaSessions.set(input.sessionId, {
      ...session,
      claimed: true
    });
  }

  const walletKey = normalizeWalletAddress(input.walletAddress);
  const now = Date.now();

  pushLearnerHistory(input.walletAddress, {
    type: "trivia-claim",
    walletAddress: walletKey,
    createdAt: now,
    details: {
      sessionId: input.sessionId,
      rewardAmount: input.rewardAmount,
      correctAnswers: input.correctAnswers,
      totalQuestions: input.totalQuestions,
      categoryTitle: input.categoryTitle,
      txHash: input.txHash ?? null
    }
  });

  await appendLog({
    type: "trivia-claim",
    walletAddress: walletKey,
    createdAt: new Date(now).toISOString(),
    sessionId: input.sessionId,
    rewardAmount: input.rewardAmount,
    correctAnswers: input.correctAnswers,
    totalQuestions: input.totalQuestions,
    categoryTitle: input.categoryTitle,
    txHash: input.txHash ?? null
  });
}

export function hasClaimedExamReward(claimKey: string) {
  return examClaims.has(claimKey);
}

export async function markExamRewardClaimed(input: {
  claimKey: string;
  walletAddress: `0x${string}`;
  courseId: string;
  lessonId: string;
  rewardAmount: string;
  score: number;
  totalQuestions: number;
  txHash?: string;
}) {
  const walletKey = normalizeWalletAddress(input.walletAddress);
  const now = Date.now();

  examClaims.set(input.claimKey, {
    claimKey: input.claimKey,
    walletAddress: walletKey,
    courseId: input.courseId,
    lessonId: input.lessonId,
    createdAt: now
  });

  pushLearnerHistory(input.walletAddress, {
    type: "exam-claim",
    walletAddress: walletKey,
    createdAt: now,
    details: {
      claimKey: input.claimKey,
      courseId: input.courseId,
      lessonId: input.lessonId,
      rewardAmount: input.rewardAmount,
      score: input.score,
      totalQuestions: input.totalQuestions,
      txHash: input.txHash ?? null
    }
  });

  await appendLog({
    type: "exam-claim",
    walletAddress: walletKey,
    createdAt: new Date(now).toISOString(),
    claimKey: input.claimKey,
    courseId: input.courseId,
    lessonId: input.lessonId,
    rewardAmount: input.rewardAmount,
    score: input.score,
    totalQuestions: input.totalQuestions,
    txHash: input.txHash ?? null
  });
}

export function getLearnerRewardHistory(walletAddress?: `0x${string}`) {
  return learnerHistory.get(normalizeWalletAddress(walletAddress)) ?? [];
}

