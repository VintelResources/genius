export async function connectWallet() {
  if (typeof window === "undefined") {
    return null;
  }

  const ethereum = (window as any).ethereum;

  if (!ethereum?.request) {
    return null;
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts"
  });

  return accounts?.[0] ?? null;
}

export async function getGeniusBalance(_address?: string) {
  return 0;
}

export async function donateToFoundation(..._args: any[]) {
  return {
    ok: true,
    hash: "",
    message: "Donation simulated."
  };
}

export async function getPositionNFTMetadata(..._args: any[]) {
  return {
    tokenId: "",
    image: "",
    name: "Genius Position",
    description: "Learning reward position metadata."
  };
}
