function readString(value: string | undefined, fallback = "") {
  const next = value?.trim();
  return next && next.length > 0 ? next : fallback;
}

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");
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

export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

export function getPublicVoiceConfig() {
  return {
    voiceEnabled: readBoolean(process.env.NEXT_PUBLIC_AI_VOICE_ENABLED, true),
    readQuestions: readBoolean(process.env.NEXT_PUBLIC_AI_READ_QUESTIONS, true),
    readCorrectExplanations: readBoolean(
      process.env.NEXT_PUBLIC_AI_READ_CORRECT_EXPLANATIONS,
      true
    ),
    readWrongExplanations: readBoolean(
      process.env.NEXT_PUBLIC_AI_READ_WRONG_EXPLANATIONS,
      true
    ),
    readRewardMessages: readBoolean(
      process.env.NEXT_PUBLIC_AI_READ_REWARD_MESSAGES,
      false
    ),
    voiceName: readString(process.env.NEXT_PUBLIC_AI_VOICE_NAME, "")
  };
}

export function getVoiceRateForBand(band: LearnerBand) {
  switch (band) {
    case "toddlers":
      return readNumber(process.env.NEXT_PUBLIC_AI_TODDLER_VOICE_RATE, 0.9);
    case "primary":
      return readNumber(process.env.NEXT_PUBLIC_AI_PRIMARY_VOICE_RATE, 0.95);
    case "secondary":
      return readNumber(process.env.NEXT_PUBLIC_AI_SECONDARY_VOICE_RATE, 1.0);
    case "tertiary":
      return readNumber(process.env.NEXT_PUBLIC_AI_TERTIARY_VOICE_RATE, 1.02);
    default:
      return 1;
  }
}

