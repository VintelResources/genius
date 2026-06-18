"use server";

import { computeReward, getProtocolSummary } from "@/lib/reward-protocol";

export async function getRewardProtocolSummary() {
  return {
    ok: true,
    summary: await getProtocolSummary()
  };
}

export async function previewReward(input: {
  walletAddress: `0x${string}`;
  rewardType: "trivia" | "exam" | "mastery";
  subject?: string;
  correctAnswers?: number;
  score?: number;
  totalQuestions?: number;
}) {
  return {
    ok: true,
    preview: await computeReward(input)
  };
}

