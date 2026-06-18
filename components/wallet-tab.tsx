"use client";

import React, { useMemo, useState } from "react";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { erc20Abi, GENI_TOKEN_ADDRESS } from "@/lib/geni-token";

export default function WalletTab(_props: { rewardNonce?: number } = {}) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState("");

  const {
    data,
    isLoading,
    refetch
  } = useReadContracts({
    contracts: [
      {
        address: GENI_TOKEN_ADDRESS,
        abi: erc20Abi as any,
        functionName: "symbol" as any
      },
      {
        address: GENI_TOKEN_ADDRESS,
        abi: erc20Abi as any,
        functionName: "decimals" as any
      },
      {
        address: GENI_TOKEN_ADDRESS,
        abi: erc20Abi as any,
        functionName: "balanceOf" as any,
        args: address ? [address] : undefined
      }
    ] as any,
    query: {
      enabled: Boolean(address)
    }
  });

  const symbol = (data?.[0]?.result as string | undefined) ?? "GENI";
  const decimals = Number((data?.[1]?.result as number | bigint | undefined) ?? 18);
  const rawBalance = (data?.[2]?.result as bigint | undefined) ?? BigInt(0);

  const formattedBalance = useMemo(() => {
    try {
      return formatUnits(rawBalance, decimals);
    } catch {
      return "0";
    }
  }, [rawBalance, decimals]);

  async function handleTransfer() {
    setTransferStatus("");

    if (!isConnected || !address) {
      setTransferStatus("Connect your wallet first.");
      return;
    }

    if (!recipient || !recipient.startsWith("0x")) {
      setTransferStatus("Enter a valid recipient wallet address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setTransferStatus("Enter a valid amount.");
      return;
    }

    try {
      const parsedAmount = parseUnits(amount, decimals);

      const txHash = await writeContractAsync({
        address: GENI_TOKEN_ADDRESS,
        abi: erc20Abi as any,
        functionName: "transfer" as any,
        args: [recipient as `0x${string}`, parsedAmount]
      } as any);

      setTransferStatus(`Transfer submitted: ${txHash}`);
      await refetch();
    } catch (error) {
      setTransferStatus(error instanceof Error ? error.message : "Transfer failed.");
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Genius Wallet
        </p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">
          {isLoading ? "Loading..." : `${formattedBalance} ${symbol}`}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isConnected && address ? address : "Wallet not connected"}
        </p>
      </div>

      <div className="space-y-3">
        <input
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder="Recipient address"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />

        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder={`Amount in ${symbol}`}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />

        <button
          type="button"
          onClick={handleTransfer}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700"
        >
          Send {symbol}
        </button>

        {transferStatus && (
          <p className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            {transferStatus}
          </p>
        )}
      </div>
    </div>
  );
}


