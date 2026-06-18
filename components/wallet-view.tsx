"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

type SwapAsset = "USDC" | "ETH" | "BTC" | "SOL";

const ASSET_OPTIONS: {
  symbol: SwapAsset;
  rate: number;
  precision: number;
}[] = [
  { symbol: "USDC", rate: 1, precision: 4 },
  { symbol: "ETH", rate: 0.00031, precision: 6 },
  { symbol: "BTC", rate: 0.000012, precision: 8 },
  { symbol: "SOL", rate: 0.0065, precision: 6 }
];

function formatWallet(address?: string) {
  if (!address) {
    return "Not Connected";
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function getWalletBalanceStorageKey(address?: string) {
  return `geni_wallet_balance_${address?.toLowerCase() ?? "guest"}`;
}

export default function WalletView() {
  const { address, isConnected } = useAccount();

  const [gBalance, setGBalance] = useState(0);
  const [swapAmount, setSwapAmount] = useState("0.00");
  const [swapTo, setSwapTo] = useState<SwapAsset>("USDC");
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState("Ready to bridge your knowledge assets.");
  const [lastBridge, setLastBridge] = useState<null | {
    fromAmount: string;
    toAmount: string;
    asset: SwapAsset;
  }>(null);
  const [lastRewardCredit, setLastRewardCredit] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(getWalletBalanceStorageKey(address));
      setGBalance(stored ? Number.parseFloat(stored) || 0 : 0);
    } catch {
      setGBalance(0);
    }
  }, [address]);

  useEffect(() => {
    try {
      window.localStorage.setItem(getWalletBalanceStorageKey(address), gBalance.toFixed(8));
    } catch {}
  }, [address, gBalance]);

  useEffect(() => {
    function handleWalletCredit(event: Event) {
      const customEvent = event as CustomEvent<{
        amount?: string;
        source?: string;
        categoryTitle?: string;
      }>;

      const amount = Number.parseFloat(customEvent.detail?.amount ?? "0");

      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      setGBalance((current) => Number((current + amount).toFixed(8)));
      setLastRewardCredit(
        `Received ${amount.toFixed(8)} G from ${customEvent.detail?.source ?? "reward"}${
          customEvent.detail?.categoryTitle ? ` • ${customEvent.detail.categoryTitle}` : ""
        }.`
      );
      setStatus("Wallet updated with new G reward.");
    }

    window.addEventListener("geni-wallet-credit", handleWalletCredit as EventListener);

    return () => {
      window.removeEventListener("geni-wallet-credit", handleWalletCredit as EventListener);
    };
  }, []);

  const selectedAsset = useMemo(() => {
    return ASSET_OPTIONS.find((asset) => asset.symbol === swapTo) ?? ASSET_OPTIONS[0];
  }, [swapTo]);

  const numericSwapAmount = useMemo(() => {
    const parsed = Number.parseFloat(swapAmount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [swapAmount]);

  const swapPreview = useMemo(() => {
    const converted = numericSwapAmount * selectedAsset.rate;
    return converted.toFixed(selectedAsset.precision);
  }, [numericSwapAmount, selectedAsset]);

  const canExecute =
    isConnected &&
    numericSwapAmount > 0 &&
    numericSwapAmount <= gBalance &&
    !isExecuting;

  async function executeBridgeTransaction() {
    if (!canExecute) {
      return;
    }

    setIsExecuting(true);
    setStatus("Bridge transaction submitted. Preparing cross-chain routing...");

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setGBalance((current) => Number(Math.max(0, current - numericSwapAmount).toFixed(8)));
    setLastBridge({
      fromAmount: numericSwapAmount.toFixed(2),
      toAmount: swapPreview,
      asset: swapTo
    });
    setStatus(`Bridge initiated: ${numericSwapAmount.toFixed(2)} G → ${swapPreview} ${swapTo}.`);
    setSwapAmount("0.00");
    setIsExecuting(false);
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          The Vault
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">
          Your node&apos;s knowledge assets across the BNB Ecosystem.
        </h2>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              BNB Identity Linked
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-3xl">
                ⛓️
              </div>

              <div>
                <div className="text-lg font-semibold text-white">
                  {isConnected ? "BNB Wallet Connected" : "Wallet Not Connected"}
                </div>
                <div className="mt-1 text-sm text-white/75">
                  {formatWallet(address)}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              My Node Stash
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-5xl font-black text-white">
                {gBalance.toFixed(8)}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-2xl font-black text-cyan-100 animate-spin">
                G
              </div>
            </div>
            <div className="mt-2 text-lg font-semibold text-cyan-100">G</div>
            <div className="mt-3 text-sm text-white/70">
              Knowledge blocks currently available inside your node wallet.
            </div>
            {lastRewardCredit ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {lastRewardCredit}
              </div>
            ) : null}
          </section>

          {lastBridge ? (
            <section className="rounded-[28px] border border-emerald-300/20 bg-emerald-500/10 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-emerald-100">
                Last Bridge Transaction
              </div>
              <div className="mt-3 text-lg font-semibold text-white">
                {lastBridge.fromAmount} G → {lastBridge.toAmount} {lastBridge.asset}
              </div>
              <div className="mt-2 text-sm text-white/80">
                Cross-chain latency estimate remains 5–10 minutes.
              </div>
            </section>
          ) : null}
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              BNB Native Bridge
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              High-Performance Web3 Swap Protocol
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Convert your Knowledge Blocks (G) into liquidity across the BNB Smart Chain or external chains.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">Swap From</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Avail: {gBalance.toFixed(8)} G
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    value={swapAmount}
                    onChange={(event) => setSwapAmount(event.target.value)}
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-3xl font-black text-white outline-none placeholder:text-white/30"
                  />
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-4 text-lg font-bold text-cyan-100">
                    G
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xl text-white">
                  ⇄
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-semibold text-white">Swap To</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ASSET_OPTIONS.map((asset) => {
                    const active = asset.symbol === swapTo;

                    return (
                      <button
                        key={asset.symbol}
                        type="button"
                        onClick={() => setSwapTo(asset.symbol)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-white/80"
                        }`}
                      >
                        {asset.symbol}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-3xl font-black text-white">{swapPreview}</div>
                  <div className="mt-1 text-lg font-semibold text-cyan-100">{swapTo}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={executeBridgeTransaction}
                disabled={!canExecute}
                className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {isExecuting ? "Executing Bridge Transaction..." : "Execute Bridge Transaction"}
              </button>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                ⚠️ Cross-Chain Latency: ~5-10 Minutes Expected
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Bridge Status
            </div>
            <div className="mt-3 text-sm leading-6 text-white/80">{status}</div>
            {!isConnected ? (
              <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                Connect your BNB wallet from the auth shell to activate vault transactions.
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </section>
  );
}

