import { privateKeyToAccount } from "viem/accounts";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseUnits
} from "viem";
import { bsc } from "viem/chains";
import { erc20Abi, GENI_TOKEN_ADDRESS } from "@/lib/geni-token";

const rpcUrl =
  process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org";

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(rpcUrl)
});

function getValidatedPrivateKey(): `0x${string}` {
  const privateKey = process.env.REWARD_TREASURY_PRIVATE_KEY?.trim();

  if (!privateKey) {
    throw new Error("Missing REWARD_TREASURY_PRIVATE_KEY");
  }

  if (/^0x[a-fA-F0-9]{40}$/.test(privateKey)) {
    throw new Error(
      "REWARD_TREASURY_PRIVATE_KEY contains a wallet address, not a private key. Use a 0x-prefixed 64-hex-character private key."
    );
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error(
      "Invalid REWARD_TREASURY_PRIVATE_KEY. Expected a 0x-prefixed 64-hex-character private key."
    );
  }

  return privateKey as `0x${string}`;
}

export async function awardGeniReward(
  to: `0x${string}`,
  amountHuman = "0.00000001"
) {
  const privateKey = getValidatedPrivateKey();
  const treasury = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account: treasury,
    chain: bsc,
    transport: http(rpcUrl)
  });

  const decimals = await publicClient.readContract(({
    address: GENI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals" } as any));

  const amount = parseUnits(amountHuman, Number(decimals));

  const treasuryBalance = await publicClient.readContract(({
    address: GENI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf", args: [treasury.address] } as any));

  if ((treasuryBalance as bigint) < amount) {
    throw new Error("Treasury GENI balance is too low");
  }

  const hash = await walletClient.writeContract({
    address: GENI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, amount],
    account: treasury,
    chain: bsc
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error("Reward transaction failed on-chain");
  }

  return {
    hash,
    status: receipt.status,
    humanAmount: formatUnits(amount, Number(decimals))
  };
}





