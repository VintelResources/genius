import { query } from "@/lib/db";

export type SubscriptionGate =
  | {
      ok: true;
      wallet_address: string;
      status: string;
      provider: string;
      code?: string;
      subscriptionUrl?: string;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      code?: string;
      subscriptionUrl?: string;
    };

export async function getLifetimeSubscriptionStatus(walletAddress: string) {
  const rows = await query<{
    wallet_address: string;
    status: string;
    provider: string;
  }>(
    `
    select wallet_address, status, provider
    from subscriptions
    where lower(wallet_address) = lower($1)
    limit 1
    `,
    [walletAddress]
  );

  return rows[0] ?? null;
}

export async function requireActiveSubscription(
  walletAddress: string
): Promise<SubscriptionGate> {
  if (!walletAddress) {
    return {
      ok: false,
      code: "WALLET_REQUIRED",
      message: "Connect your wallet before claiming rewards."
    };
  }

  try {
    const subscription = await getLifetimeSubscriptionStatus(walletAddress);

    if (!subscription) {
      return {
        ok: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "No active subscription found for this wallet.",
        subscriptionUrl: "/payout"
      };
    }

    if (subscription.status !== "active" && subscription.status !== "lifetime") {
      return {
        ok: false,
        code: "SUBSCRIPTION_INACTIVE",
        message: "Your subscription is not active.",
        subscriptionUrl: "/payout"
      };
    }

    return {
      ok: true,
      wallet_address: subscription.wallet_address,
      status: subscription.status,
      provider: subscription.provider
    };
  } catch {
    return {
      ok: false,
      code: "SUBSCRIPTION_CHECK_FAILED",
      message: "Could not verify subscription status."
    };
  }
}

export async function activateLifetimeSubscription(input: {
  walletAddress: string;
  provider?: string;
  externalReference?: string;
  amountPaid?: number;
}) {
  if (!input.walletAddress) {
    return {
      ok: false,
      code: "WALLET_REQUIRED",
      message: "Wallet address is required."
    };
  }

  const provider = input.provider ?? "manual";

  await query(
    `
    insert into subscriptions (wallet_address, status, provider)
    values ($1, 'lifetime', $2)
    on conflict (wallet_address)
    do update set
      status = 'lifetime',
      provider = $2
    `,
    [input.walletAddress, provider]
  );

  return {
    ok: true,
    wallet_address: input.walletAddress,
    status: "lifetime",
    provider,
    externalReference: input.externalReference,
    amountPaid: input.amountPaid ?? 0,
    message: "Lifetime subscription activated."
  };
}

