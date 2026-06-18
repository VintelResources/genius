"use server";

// file: actions/realCourses.ts
import { awardGeniReward } from "@/lib/rewards";
import { getCourse, groupCoursesByBand } from "@/lib/course-catalog";
import { generateAiQuestions } from "@/lib/ai-question-engine";
import { hasClaimedExamReward, markExamRewardClaimed } from "@/lib/reward-guard";
import { requireActiveSubscription } from "@/lib/subscriptions";
import { computeReward, recordRewardEmission } from "@/lib/reward-protocol";
import { getRewardConfig, getServerAiConfig } from "@/lib/server-env";
import { getTriviaCategoryGroups, getTriviaCategories } from "@/lib/trivia-categories";

type ExamQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation?: string;
};

type TutorReviewItem = {
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
};

type QuestionResult = {
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

type ModuleExamSession = {
  courseId: string;
  lessonId: string;
  answersSubmitted: boolean;
  generatedQuestions: ExamQuestion[];
  score?: number;
  totalQuestions?: number;
  rewardAmount?: string;
  passed?: boolean;
  thresholdScore?: number;
  review?: TutorReviewItem[];
};

type PassedModuleRecord = {
  key: string;
  courseId: string;
  lessonId: string;
  passed: boolean;
  claimed: boolean;
  score: number;
  totalQuestions: number;
  thresholdScore: number;
  rewardAmount: string;
  review: TutorReviewItem[];
  subject: string;
};

const globalStore = globalThis as typeof globalThis & {
  __courseLessonProgress?: Map<string, Set<string>>;
  __moduleExamSessions?: Map<string, ModuleExamSession>;
  __passedModuleRecords?: Map<string, PassedModuleRecord>;
};

const lessonProgress = globalStore.__courseLessonProgress ?? new Map<string, Set<string>>();
const moduleExamSessions = globalStore.__moduleExamSessions ?? new Map<string, ModuleExamSession>();
const passedModuleRecords = globalStore.__passedModuleRecords ?? new Map<string, PassedModuleRecord>();

globalStore.__courseLessonProgress = lessonProgress;
globalStore.__moduleExamSessions = moduleExamSessions;
globalStore.__passedModuleRecords = passedModuleRecords;

export async function claimModuleExamReward(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
}) {
  const record = passedModuleRecords.get(input.sessionId);

  if (!record || !record.passed) {
    return {
      ok: false,
      rewarded: false,
      message: "Reward is only available after passing this module with at least 80%."
    };
  }

  if (record.claimed || hasClaimedExamReward(input.sessionId)) {
    return {
      ok: false,
      rewarded: false,
      message: "Reward already claimed for this passed module."
    };
  }

  const subscriptionGate = await requireActiveSubscription(input.walletAddress) as {
    ok?: boolean;
    message?: string;
    wallet_address?: string;
    status?: string;
    provider?: string;
    code?: string;
    subscriptionUrl?: string;
  };

  if (!subscriptionGate.ok) {
    return {
      ok: false,
      rewarded: false,
      code: subscriptionGate.code,
      message: subscriptionGate.message,
      subscriptionUrl: subscriptionGate.subscriptionUrl
    };
  }

  const computation = await computeReward({
    walletAddress: input.walletAddress,
    rewardType: "exam",
    subject: record.subject,
    score: record.score,
    totalQuestions: record.totalQuestions
  });

  if (computation.blocked) {
    return {
      ok: false,
      rewarded: false,
      message: computation.blockReason ?? "Reward blocked by protocol."
    };
  }

  const rewardAmount = computation.effectiveReward.toFixed(8);
  const reward = await awardGeniReward(input.walletAddress, rewardAmount);

  await markExamRewardClaimed({
    claimKey: input.sessionId,
    walletAddress: input.walletAddress,
    courseId: record.courseId,
    lessonId: record.lessonId,
    rewardAmount,
    score: record.score,
    totalQuestions: record.totalQuestions,
    txHash: reward.hash
  });

  await recordRewardEmission({
    walletAddress: input.walletAddress,
    rewardType: "exam",
    subject: record.subject,
    txHash: reward.hash,
    computation
  });

  passedModuleRecords.set(input.sessionId, {
    ...record,
    claimed: true,
    rewardAmount
  });

  moduleExamSessions.delete(input.sessionId);

  return {
    ok: true,
    rewarded: true,
    score: record.score,
    rewardAmount,
    reward,
    protocol: computation,
    message: `Reward sent: ${rewardAmount} GENI`
  };
}

export async function getCatalog() {
  return groupCoursesByBand();
}

export async function getProgress(walletAddress?: `0x${string}`) {
  return Array.from(lessonProgress.entries())
    .filter(([key]) => key.startsWith(`${walletAddress?.toLowerCase() ?? "guest"}:`))
    .map(([key, value]) => ({
      key,
      completedLessonIds: Array.from(value)
    }));
}

export async function getExamStatus(walletAddress?: `0x${string}`) {
  return Array.from(passedModuleRecords.values()).filter((record) =>
    record.key.startsWith(`${walletAddress?.toLowerCase() ?? "guest"}:`)
  );
}

export async function completeCourseLesson(input: {
  courseId: string;
  lessonId: string;
  walletAddress?: `0x${string}`;
}) {
  const course = getCourse(input.courseId);

  if (!course) {
    return { ok: false, message: "Course not found." };
  }

  if (!course.lessons.some((lesson) => lesson.id === input.lessonId)) {
    return { ok: false, message: "Lesson not found." };
  }

  const learner = input.walletAddress?.toLowerCase() ?? "guest";
  const key = `${learner}:${input.courseId}`;
  const current = lessonProgress.get(key) ?? new Set<string>();
  current.add(input.lessonId);
  lessonProgress.set(key, current);

  return {
    ok: true,
    completedLessonIds: Array.from(current),
    message: "Lesson completed. Module exam unlocked."
  };
}

export async function generateLessonQuiz(input: {
  courseId: string;
  lessonId: string;
}) {
  const config = getServerAiConfig();
  const course = getCourse(input.courseId);

  if (!course) {
    return { ok: false, message: "Course not found." };
  }

  const lesson = course.lessons.find((item) => item.id === input.lessonId);

  if (!lesson) {
    return { ok: false, message: "Lesson not found." };
  }

  const questions = await generateAiQuestions({
    learnerBand: course.band,
    subject: course.subject,
    topic: lesson.title,
    mode: "lesson",
    count: config.questionCount,
    context: `${lesson.summary} ${lesson.lessonContent} ${lesson.keyPoints.join("; ")}`,
    fallbackQuestions: []
  });

  return {
    ok: true,
    title: lesson.lessonQuizTitle ?? `${lesson.title} Lesson Quiz`,
    questions
  };
}

export async function startModuleExam(input: {
  courseId: string;
  lessonId: string;
  walletAddress?: `0x${string}`;
}) {
  const config = getServerAiConfig();
  const course = getCourse(input.courseId);

  if (!course) {
    return { ok: false, message: "Course not found." };
  }

  const lesson = course.lessons.find((item) => item.id === input.lessonId);

  if (!lesson) {
    return { ok: false, message: "Lesson not found." };
  }

  const learner = input.walletAddress?.toLowerCase() ?? "guest";
  const progress = lessonProgress.get(`${learner}:${input.courseId}`) ?? new Set<string>();

  if (!progress.has(input.lessonId)) {
    return { ok: false, message: "Complete this lesson before taking its exam." };
  }

  const sessionId = `${learner}:${input.courseId}:${input.lessonId}`

  const generatedQuestions = await generateAiQuestions({
    learnerBand: course.band,
    subject: course.subject,
    topic: lesson.title,
    mode: "exam",
    count: config.questionCount,
    context: `${lesson.summary} ${lesson.lessonContent} ${lesson.keyPoints.join("; ")}`,
    fallbackQuestions: []
  });

  moduleExamSessions.set(sessionId, {
    courseId: input.courseId,
    lessonId: input.lessonId,
    answersSubmitted: false,
    generatedQuestions
  });

  return {
    ok: true,
    sessionId,
    title: `${lesson.title} Exam`,
    lessonTitle: lesson.title,
    questions: generatedQuestions.map((question, index) => ({
      index,
      prompt: question.prompt,
      options: question.options
    }))
  };
}

export async function submitModuleExam(input: {
  sessionId: string;
  answers: string[];
  walletAddress?: `0x${string}`;
}) {
  const rewardConfig = getRewardConfig();
  const session = moduleExamSessions.get(input.sessionId);

  if (!session) {
    return { ok: false, message: "Module exam session not found." };
  }

  const questions = session.generatedQuestions ?? [];
  const questionResults = questions.map((question, index) => {
    const selectedAnswer = input.answers[index]?.trim() ?? "";
    const isCorrect = selectedAnswer === question.correctAnswer;
    const explanation = isCorrect
      ? `Tutor: Correct. "${question.correctAnswer}" is the right answer for this question.`
      : question.explanation ??
        `Tutor: "${question.correctAnswer}" is correct because it best fits the topic being tested.`;

    return {
      prompt: question.prompt,
      selectedAnswer: selectedAnswer || "No answer selected",
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation
    };
  });

  const score = questionResults.filter((item) => item.isCorrect).length;
  const totalQuestions = questions.length;
  const thresholdScore = Math.ceil(totalQuestions * rewardConfig.examPassThreshold);
  const passed = score >= thresholdScore;

  session.answersSubmitted = true;
  session.score = score;
  session.totalQuestions = totalQuestions;
  session.rewardAmount = passed ? "protocol-computed-on-claim" : "0.00000000";
  session.passed = passed;
  session.thresholdScore = thresholdScore;
  session.review = questionResults
    .filter((item) => !item.isCorrect)
    .map((item) => ({
      prompt: item.prompt,
      selectedAnswer: item.selectedAnswer,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation
    }));

  moduleExamSessions.set(input.sessionId, session);

  return {
    ok: true,
    score,
    totalQuestions,
    thresholdScore,
    passed,
    rewardAmount: passed ? "Protocol-scaled reward unlocked" : "0.00000000",
    review: session.review ?? [],
    questionResults,
    message: passed
      ? `Passed. You scored ${score}/${totalQuestions}. Protocol reward unlocked.`
      : `You scored ${score}/${totalQuestions}. You need ${thresholdScore}/${totalQuestions} to pass.`
  };
}





