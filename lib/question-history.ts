type LearnerAddress = `0x${string}` | undefined;

type TriviaHistoryEntry = {
  walletKey: string;
  categoryTitle: string;
  prompts: string[];
  updatedAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __triviaQuestionHistory?: Map<string, TriviaHistoryEntry>;
};

const triviaQuestionHistory =
  globalStore.__triviaQuestionHistory ?? new Map<string, TriviaHistoryEntry>();

globalStore.__triviaQuestionHistory = triviaQuestionHistory;

function walletKey(walletAddress: LearnerAddress) {
  return walletAddress?.toLowerCase() ?? "guest";
}

function historyKey(walletAddress: LearnerAddress, categoryTitle: string) {
  return `${walletKey(walletAddress)}::${categoryTitle.trim().toLowerCase()}`;
}

export function getRecentTriviaPrompts(input: {
  walletAddress?: `0x${string}`;
  categoryTitle: string;
  limit?: number;
}) {
  const key = historyKey(input.walletAddress, input.categoryTitle);
  const entry = triviaQuestionHistory.get(key);

  if (!entry) {
    return [];
  }

  return entry.prompts.slice(0, input.limit ?? 40);
}

export function recordTriviaPrompts(input: {
  walletAddress?: `0x${string}`;
  categoryTitle: string;
  prompts: string[];
}) {
  const key = historyKey(input.walletAddress, input.categoryTitle);
  const current = triviaQuestionHistory.get(key);

  const normalizedPrompts = input.prompts
    .map((prompt) => prompt.trim())
    .filter(Boolean);

  const merged = [
    ...normalizedPrompts,
    ...(current?.prompts ?? [])
  ];

  const unique = Array.from(new Set(merged)).slice(0, 120);

  triviaQuestionHistory.set(key, {
    walletKey: walletKey(input.walletAddress),
    categoryTitle: input.categoryTitle,
    prompts: unique,
    updatedAt: Date.now()
  });
}

