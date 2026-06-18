function readString(value: string | undefined, fallback = "") {
  const next = value?.trim();
  return next && next.length > 0 ? next : fallback;
}

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return fallback;
}

export function getServerAiConfig() {
  return {
    questionCount: Math.max(1, readInteger(process.env.AI_QUESTION_COUNT, 10)),
    temperature: readNumber(process.env.AI_QUESTION_TEMPERATURE, 0.95),
    maxRetries: Math.max(1, readInteger(process.env.AI_MAX_RETRIES, 3)),
    triviaAvoidHistoryLimit: Math.max(
      1,
      readInteger(process.env.AI_TRIVIA_AVOID_HISTORY_LIMIT, 40)
    ),
    examAvoidHistoryLimit: Math.max(
      1,
      readInteger(process.env.AI_EXAM_AVOID_HISTORY_LIMIT, 20)
    ),
    enableUniquenessFilter: readBoolean(
      process.env.AI_ENABLE_UNIQUENESS_FILTER,
      true
    ),
    enableTopicRotation: readBoolean(process.env.AI_ENABLE_TOPIC_ROTATION, true),
    enableLevelAdaptation: readBoolean(
      process.env.AI_ENABLE_LEVEL_ADAPTATION,
      true
    ),
    enablePerformanceAdaptation: readBoolean(
      process.env.AI_ENABLE_PERFORMANCE_ADAPTATION,
      true
    ),
    openAiModel: readString(process.env.OPENAI_QUESTION_MODEL, "gpt-4.1-mini"),
    geminiModel: readString(
      process.env.GEMINI_QUESTION_MODEL,
      "gemini-2.5-flash"
    )
  };
}

export function getRewardConfig() {
  return {
    triviaRewardPerCorrect: readNumber(
      process.env.TRIVIA_REWARD_PER_CORRECT,
      0.00000001
    ),
    examRewardFixed: readNumber(process.env.EXAM_REWARD_FIXED, 0.01),
    examPassThreshold: readNumber(process.env.EXAM_PASS_THRESHOLD, 0.8),
    triviaRateLimitWindowMs: Math.max(
      1000,
      readInteger(process.env.TRIVIA_RATE_LIMIT_WINDOW_MS, 600000)
    ),
    triviaRateLimitMaxSessions: Math.max(
      1,
      readInteger(process.env.TRIVIA_RATE_LIMIT_MAX_SESSIONS, 5)
    )
  };
}

