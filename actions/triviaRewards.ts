"use server";

import { awardGeniReward } from "@/lib/rewards";
import { markTriviaClaimed, validateTriviaClaim } from "@/lib/reward-guard";
import { requireActiveSubscription } from "@/lib/subscriptions";
import { computeReward, recordRewardEmission } from "@/lib/reward-protocol";

export async function claimTriviaReward(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
  correctAnswers: number;
  totalQuestions: number;
  categoryTitle: string;
  subject?: string;
}) {
  const sessionValidation = validateTriviaClaim({
    sessionId: input.sessionId.trim(),
    walletAddress: input.walletAddress
  });

  if (!sessionValidation.ok) {
    return {
      ok: false,
      rewarded: false,
      message: sessionValidation.message
    };
  }

  const subscriptionGate = await requireActiveSubscription(input.walletAddress) as {
    ok?: boolean;
    message?: string;
    wallet_address?: string;
    status?: string;
    provider?: string;
    code?: string;
    subscriptionUrl?: string;
  };

  if (!subscriptionGate.ok) {
    return {
      ok: false,
      rewarded: false,
      code: subscriptionGate.code,
      message: subscriptionGate.message,
      subscriptionUrl: subscriptionGate.subscriptionUrl
    };
  }

  const correctAnswers = Math.max(0, Math.floor(input.correctAnswers));
  const totalQuestions = Math.max(0, Math.floor(input.totalQuestions));

  if (correctAnswers <= 0 || totalQuestions <= 0) {
    return {
      ok: false,
      rewarded: false,
      message: "No correct trivia answers available for reward."
    };
  }

  const computation = await computeReward({
    walletAddress: input.walletAddress,
    rewardType: "trivia",
    subject: input.subject ?? input.categoryTitle,
    correctAnswers
  });

  if (computation.blocked) {
    return {
      ok: false,
      rewarded: false,
      message: computation.blockReason ?? "Reward blocked by protocol."
    };
  }

  const rewardAmount = computation.effectiveReward.toFixed(8);
  const reward = await awardGeniReward(input.walletAddress, rewardAmount);

  await markTriviaClaimed({
    sessionId: input.sessionId,
    walletAddress: input.walletAddress,
    rewardAmount,
    correctAnswers,
    totalQuestions,
    categoryTitle: input.categoryTitle,
    txHash: reward.hash
  });

  await recordRewardEmission({
    walletAddress: input.walletAddress,
    rewardType: "trivia",
    subject: input.subject ?? input.categoryTitle,
    txHash: reward.hash,
    computation
  });

  return {
    ok: true,
    rewarded: true,
    rewardAmount,
    reward,
    protocol: computation,
    message: `Trivia reward sent: ${rewardAmount} G. Epoch ${computation.currentEpoch + 1}, halving multiplier ${computation.halvingMultiplier.toFixed(4)}.`
  };
}



