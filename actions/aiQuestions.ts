"use server";

import { generateAiQuestions, type LearnerBand } from "@/lib/ai-question-engine";
import { createServerTriviaSession } from "@/lib/reward-guard";
import { getRecentTriviaPrompts, recordTriviaPrompts } from "@/lib/question-history";
import { getServerAiConfig } from "@/lib/server-env";

export async function generateTriviaQuestions(input: {
  learnerBand: LearnerBand;
  subject: string;
  topic: string;
  categoryTitle: string;
  walletAddress?: `0x${string}`;
}) {
  const config = getServerAiConfig();

  const session = createServerTriviaSession({
    walletAddress: input.walletAddress,
    categoryTitle: input.categoryTitle
  });

  if (!session.ok) {
    return session;
  }

  const recentPrompts = getRecentTriviaPrompts({
    walletAddress: input.walletAddress,
    categoryTitle: input.categoryTitle,
    limit: config.triviaAvoidHistoryLimit
  });

  const questions = await generateAiQuestions({
    learnerBand: input.learnerBand,
    subject: input.subject,
    topic: input.topic,
    mode: "trivia",
    count: config.questionCount,
    avoidPrompts: recentPrompts
  });

  recordTriviaPrompts({
    walletAddress: input.walletAddress,
    categoryTitle: input.categoryTitle,
    prompts: questions.map((question) => question.prompt)
  });

  return {
    ok: true,
    sessionId: session.sessionId,
    questions
  };
}

export async function createTriviaSession(input: {
  learnerBand: LearnerBand;
  subject: string;
  topic: string;
  categoryTitle: string;
  walletAddress?: `0x${string}`;
}) {
  return generateTriviaQuestions(input);
}

export async function generateLearningQuestions(input: {
  learnerBand: LearnerBand;
  subject: string;
  topic: string;
  context?: string;
}) {
  const config = getServerAiConfig();

  const questions = await generateAiQuestions({
    learnerBand: input.learnerBand,
    subject: input.subject,
    topic: input.topic,
    mode: "path",
    count: config.questionCount,
    context: input.context
  });

  return {
    ok: true,
    questions
  };
}

