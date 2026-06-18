import { query, withTransaction } from "@/lib/db";

export type RewardType = "trivia" | "exam" | "mastery";

export type RewardComputationInput = {
  walletAddress: `0x${string}`;
  rewardType: RewardType;
  subject?: string | null;
  correctAnswers?: number;
  score?: number;
  totalQuestions?: number;
};

export type RewardComputationResult = {
  rewardType: RewardType;
  baseReward: number;
  effectiveReward: number;
  totalMinted: number;
  remainingSupply: number;
  currentEpoch: number;
  halvingMultiplier: number;
  trustMultiplier: number;
  subjectMultiplier: number;
  activityMultiplier: number;
  blocked: boolean;
  blockReason: string | null;
};

const MAX_SUPPLY = 21_000_000;
const HALVING_INTERVAL = 2_625_000;

const BASE_REWARDS = {
  trivia: Number.parseFloat(process.env.TRIVIA_REWARD_PER_CORRECT ?? "0.00000001") || 0.00000001,
  exam: Number.parseFloat(process.env.EXAM_REWARD_FIXED ?? "0.01") || 0.01,
  mastery: Number.parseFloat(process.env.MASTERY_REWARD_FIXED ?? "0.0001") || 0.0001
} as const;

function normalizeWallet(walletAddress: `0x${string}`) {
  return walletAddress.toLowerCase();
}

function normalizeSubject(subject?: string | null) {
  return (subject ?? "general").trim().toLowerCase();
}

function roundReward(value: number) {
  return Number(value.toFixed(8));
}

export function getEpoch(totalMinted: number) {
  return Math.floor(totalMinted / HALVING_INTERVAL);
}

export function getHalvingMultiplier(totalMinted: number) {
  return 1 / 2 ** getEpoch(totalMinted);
}

export async function initializeRewardProtocolTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS protocol_state (
      key TEXT PRIMARY KEY,
      numeric_value NUMERIC(38, 8) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reward_emissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_address TEXT NOT NULL,
      reward_type TEXT NOT NULL CHECK (reward_type IN ('trivia', 'exam', 'mastery')),
      subject TEXT NOT NULL,
      base_reward NUMERIC(38, 8) NOT NULL,
      effective_reward NUMERIC(38, 8) NOT NULL,
      epoch INTEGER NOT NULL,
      halving_multiplier NUMERIC(18, 8) NOT NULL,
      trust_multiplier NUMERIC(18, 8) NOT NULL,
      subject_multiplier NUMERIC(18, 8) NOT NULL,
      activity_multiplier NUMERIC(18, 8) NOT NULL,
      tx_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wallet_reward_stats (
      wallet_address TEXT PRIMARY KEY,
      trust_score NUMERIC(8, 4) NOT NULL DEFAULT 1,
      total_trivia_claims INTEGER NOT NULL DEFAULT 0,
      total_exam_claims INTEGER NOT NULL DEFAULT 0,
      total_mastery_claims INTEGER NOT NULL DEFAULT 0,
      last_reward_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_reward_emissions_wallet_created
      ON reward_emissions(wallet_address, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_reward_emissions_type_created
      ON reward_emissions(reward_type, created_at DESC);

    INSERT INTO protocol_state (key, numeric_value)
    VALUES ('total_minted', 0)
    ON CONFLICT (key) DO NOTHING;
  `);
}

export async function getTotalMinted() {
  const result = await query<{ numeric_value: string }>(
    `SELECT numeric_value::text FROM protocol_state WHERE key = 'total_minted' LIMIT 1`
  );

  return Number.parseFloat(result[0]?.numeric_value ?? "0");
}

async function getWalletTrustMultiplier(walletAddress: `0x${string}`) {
  const result = await query<{ trust_score: string }>(
    `
      SELECT trust_score::text
      FROM wallet_reward_stats
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [normalizeWallet(walletAddress)]
  );

  const trustScore = Number.parseFloat(result[0]?.trust_score ?? "1");

  if (trustScore >= 2) return 1.15;
  if (trustScore >= 1.25) return 1.05;
  if (trustScore >= 0.75) return 1;
  if (trustScore >= 0.5) return 0.8;
  return 0.6;
}

function getSubjectMultiplier(subject?: string | null) {
  const normalized = normalizeSubject(subject);

  if (["engineering", "physics", "chemistry", "economics", "forex and markets"].includes(normalized)) {
    return 1.08;
  }

  if (["early learning", "general knowledge"].includes(normalized)) {
    return 0.95;
  }

  return 1;
}

async function getActivityMultiplier(input: {
  walletAddress: `0x${string}`;
  rewardType: RewardType;
}) {
  const result = await query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM reward_emissions
      WHERE wallet_address = $1
        AND reward_type = $2
        AND created_at >= NOW() - INTERVAL '1 day'
    `,
    [normalizeWallet(input.walletAddress), input.rewardType]
  );

  const totalToday = Number.parseInt(result[0]?.total ?? "0", 10);

  if (input.rewardType !== "trivia") {
    return 1;
  }

  if (totalToday < 20) return 1;
  if (totalToday < 40) return 0.5;
  if (totalToday < 60) return 0.1;
  return 0;
}

function getBaseReward(input: RewardComputationInput) {
  if (input.rewardType === "trivia") {
    const correctAnswers = Math.max(0, Math.floor(input.correctAnswers ?? 0));
    return BASE_REWARDS.trivia * correctAnswers;
  }

  if (input.rewardType === "exam") {
    return BASE_REWARDS.exam;
  }

  return BASE_REWARDS.mastery;
}

export async function computeReward(input: RewardComputationInput): Promise<RewardComputationResult> {
  const totalMinted = await getTotalMinted();
  const remainingSupply = Math.max(0, MAX_SUPPLY - totalMinted);
  const currentEpoch = getEpoch(totalMinted);
  const halvingMultiplier = getHalvingMultiplier(totalMinted);
  const trustMultiplier = await getWalletTrustMultiplier(input.walletAddress);
  const subjectMultiplier = getSubjectMultiplier(input.subject);
  const activityMultiplier = await getActivityMultiplier({
    walletAddress: input.walletAddress,
    rewardType: input.rewardType
  });

  const baseReward = getBaseReward(input);

  if (remainingSupply <= 0) {
    return {
      rewardType: input.rewardType,
      baseReward,
      effectiveReward: 0,
      totalMinted,
      remainingSupply,
      currentEpoch,
      halvingMultiplier,
      trustMultiplier,
      subjectMultiplier,
      activityMultiplier,
      blocked: true,
      blockReason: "Max supply reached."
    };
  }

  if (activityMultiplier <= 0) {
    return {
      rewardType: input.rewardType,
      baseReward,
      effectiveReward: 0,
      totalMinted,
      remainingSupply,
      currentEpoch,
      halvingMultiplier,
      trustMultiplier,
      subjectMultiplier,
      activityMultiplier,
      blocked: true,
      blockReason: "Daily activity cap reached for this reward type."
    };
  }

  const effectiveReward = roundReward(
    Math.min(
      remainingSupply,
      baseReward * halvingMultiplier * trustMultiplier * subjectMultiplier * activityMultiplier
    )
  );

  if (effectiveReward <= 0) {
    return {
      rewardType: input.rewardType,
      baseReward,
      effectiveReward,
      totalMinted,
      remainingSupply,
      currentEpoch,
      halvingMultiplier,
      trustMultiplier,
      subjectMultiplier,
      activityMultiplier,
      blocked: true,
      blockReason: "Effective reward reduced to zero."
    };
  }

  return {
    rewardType: input.rewardType,
    baseReward,
    effectiveReward,
    totalMinted,
    remainingSupply,
    currentEpoch,
    halvingMultiplier,
    trustMultiplier,
    subjectMultiplier,
    activityMultiplier,
    blocked: false,
    blockReason: null
  };
}

export async function recordRewardEmission(input: {
  walletAddress: `0x${string}`;
  rewardType: RewardType;
  subject?: string | null;
  txHash?: string | null;
  computation: RewardComputationResult;
}) {
  const walletAddress = normalizeWallet(input.walletAddress);
  const subject = normalizeSubject(input.subject);

  await withTransaction(async (client) => {
    await client.query(
      `
        UPDATE protocol_state
        SET numeric_value = numeric_value + $1, updated_at = NOW()
        WHERE key = 'total_minted'
      `,
      [input.computation.effectiveReward]
    );

    await client.query(
      `
        INSERT INTO reward_emissions (
          wallet_address,
          reward_type,
          subject,
          base_reward,
          effective_reward,
          epoch,
          halving_multiplier,
          trust_multiplier,
          subject_multiplier,
          activity_multiplier,
          tx_hash
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        walletAddress,
        input.rewardType,
        subject,
        input.computation.baseReward,
        input.computation.effectiveReward,
        input.computation.currentEpoch,
        input.computation.halvingMultiplier,
        input.computation.trustMultiplier,
        input.computation.subjectMultiplier,
        input.computation.activityMultiplier,
        input.txHash ?? null
      ]
    );

    await client.query(
      `
        INSERT INTO wallet_reward_stats (
          wallet_address,
          trust_score,
          total_trivia_claims,
          total_exam_claims,
          total_mastery_claims,
          last_reward_at,
          updated_at
        )
        VALUES (
          $1,
          1,
          $2,
          $3,
          $4,
          NOW(),
          NOW()
        )
        ON CONFLICT (wallet_address)
        DO UPDATE SET
          total_trivia_claims = wallet_reward_stats.total_trivia_claims + $2,
          total_exam_claims = wallet_reward_stats.total_exam_claims + $3,
          total_mastery_claims = wallet_reward_stats.total_mastery_claims + $4,
          trust_score = LEAST(2.5, wallet_reward_stats.trust_score + 0.02),
          last_reward_at = NOW(),
          updated_at = NOW()
      `,
      [
        walletAddress,
        input.rewardType === "trivia" ? 1 : 0,
        input.rewardType === "exam" ? 1 : 0,
        input.rewardType === "mastery" ? 1 : 0
      ]
    );
  });
}

export async function getProtocolSummary() {
  const totalMinted = await getTotalMinted();
  const remainingSupply = Math.max(0, MAX_SUPPLY - totalMinted);
  const currentEpoch = getEpoch(totalMinted);
  const halvingMultiplier = getHalvingMultiplier(totalMinted);

  return {
    maxSupply: MAX_SUPPLY,
    halvingInterval: HALVING_INTERVAL,
    totalMinted,
    remainingSupply,
    currentEpoch,
    halvingMultiplier,
    baseRewards: BASE_REWARDS
  };
}



