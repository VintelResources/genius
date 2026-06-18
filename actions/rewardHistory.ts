"use server";

import { getLearnerRewardHistory } from "@/lib/reward-guard";

export async function getRewardHistory(walletAddress?: `0x${string}`) {
  return {
    ok: true,
    history: getLearnerRewardHistory(walletAddress)
  };
}

