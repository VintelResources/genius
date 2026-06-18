"use server";

import {
  activateLifetimeSubscription,
  getLifetimeSubscriptionStatus
} from "@/lib/subscriptions";

export async function getSubscriptionStatus(walletAddress?: `0x${string}`) {
  if (!walletAddress) {
    return {
      ok: true,
      status: null
    };
  }

  const status = await getLifetimeSubscriptionStatus(walletAddress);

  return {
    ok: true,
    status
  };
}

export async function activateLifetimeSubscriptionForWallet(input: {
  walletAddress: `0x${string}`;
  provider?: string;
  externalReference?: string;
  amountPaid?: number;
}) {
  const status = await activateLifetimeSubscription({
    walletAddress: input.walletAddress,
    provider: input.provider ?? "paypal",
    externalReference: input.externalReference,
    amountPaid: input.amountPaid
  });

  return {
    ok: true,
    status
  };
}

