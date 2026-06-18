export const GENIUS_TOKEN_ADDRESS = {
  84532: process.env.NEXT_PUBLIC_GENIUS_TOKEN_ADDRESS ?? "",
} as const;

export const REWARD_DISTRIBUTOR_ADDRESS = {
  84532: process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS ?? "",
} as const;

export const GENIUS_TOKEN_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

