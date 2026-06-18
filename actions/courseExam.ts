"use server";

import { randomUUID } from "node:crypto";
import { claimPuzzleReward } from "@/actions/aiGenerator";
import { COURSES, getCourseById, REWARD_PER_CORRECT, type Course, type Question } from "@/lib/courses";

type ExamQuestionRecord = {
  prompt: string;
  answer: string;
  hint: string;
};

type ExamSession = {
  courseId: string;
  questions: ExamQuestionRecord[];
  startedAt: number;
  submitted: boolean;
  score?: number;
  rewardAmount?: string;
};

const globalStore = globalThis as typeof globalThis & {
  __geniusCompletedLessons?: Map<string, Set<string>>;
  __geniusExamSessions?: Map<string, ExamSession>;
};

const completedLessons = globalStore.__geniusCompletedLessons ?? new Map<string, Set<string>>();
const examSessions = globalStore.__geniusExamSessions ?? new Map<string, ExamSession>();

globalStore.__geniusCompletedLessons = completedLessons;
globalStore.__geniusExamSessions = examSessions;

function getLearnerKey(walletAddress?: `0x${string}`) {
  return walletAddress?.toLowerCase() ?? "guest";
}

function formatReward(amount: number) {
  return amount.toFixed(8);
}

function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildExamQuestions(course: Course): ExamQuestionRecord[] {
  return shuffleQuestions(course.fallbackQuestions).slice(0, 10).map((question) => ({
    prompt: question.prompt,
    answer: question.answer.trim().toLowerCase(),
    hint: question.hint
  }));
}

export async function listCourses() {
  return COURSES.map((course) => ({
    id: course.id,
    title: course.title,
    topic: course.topic,
    description: course.description,
    lessons: course.lessons
  }));
}

export async function getLearnerCourseState(walletAddress?: `0x${string}`) {
  const learnerKey = getLearnerKey(walletAddress);

  return COURSES.map((course) => {
    const key = `${learnerKey}:${course.id}`;
    const done = completedLessons.get(key) ?? new Set<string>();
    const completedCount = course.lessons.filter((lesson) => done.has(lesson.id)).length;

    return {
      courseId: course.id,
      completedLessonIds: Array.from(done),
      completedCount,
      totalLessons: course.lessons.length,
      examUnlocked: completedCount === course.lessons.length
    };
  });
}

export async function completeLesson(input: {
  courseId: string;
  lessonId: string;
  walletAddress?: `0x${string}`;
}) {
  const learnerKey = getLearnerKey(input.walletAddress);
  const key = `${learnerKey}:${input.courseId}`;
  const course = getCourseById(input.courseId);

  if (!course) {
    return {
      ok: false,
      message: "Course not found."
    };
  }

  const lessonExists = course.lessons.some((lesson) => lesson.id === input.lessonId);

  if (!lessonExists) {
    return {
      ok: false,
      message: "Lesson not found."
    };
  }

  const done = completedLessons.get(key) ?? new Set<string>();
  done.add(input.lessonId);
  completedLessons.set(key, done);

  const completedCount = course.lessons.filter((lesson) => done.has(lesson.id)).length;

  return {
    ok: true,
    completedCount,
    totalLessons: course.lessons.length,
    examUnlocked: completedCount === course.lessons.length,
    message:
      completedCount === course.lessons.length
        ? "Course complete. Exam unlocked."
        : "Lesson marked complete."
  };
}

export async function startCourseExam(input: {
  courseId: string;
  walletAddress?: `0x${string}`;
}) {
  const learnerKey = getLearnerKey(input.walletAddress);
  const course = getCourseById(input.courseId);

  if (!course) {
    return {
      ok: false,
      message: "Course not found."
    };
  }

  const completionKey = `${learnerKey}:${input.courseId}`;
  const done = completedLessons.get(completionKey) ?? new Set<string>();

  if (done.size < course.lessons.length) {
    return {
      ok: false,
      message: "Finish all lessons before starting the exam."
    };
  }

  const sessionId = randomUUID();
  const questions = buildExamQuestions(course);

  examSessions.set(sessionId, {
    courseId: input.courseId,
    questions,
    startedAt: Date.now(),
    submitted: false
  });

  return {
    ok: true,
    sessionId,
    courseTitle: course.title,
    questions: questions.map((question, index) => ({
      index,
      prompt: question.prompt,
      hint: question.hint
    }))
  };
}

export async function submitCourseExam(input: {
  sessionId: string;
  answers: string[];
  walletAddress?: `0x${string}`;
}) {
  const session = examSessions.get(input.sessionId);

  if (!session) {
    return {
      ok: false,
      message: "Exam session not found."
    };
  }

  if (session.submitted) {
    return {
      ok: false,
      message: "Exam already submitted."
    };
  }

  const score = session.questions.reduce((total, question, index) => {
    const submitted = input.answers[index]?.trim().toLowerCase() ?? "";
    return total + (submitted === question.answer ? 1 : 0);
  }, 0);

  const rewardAmount = formatReward(score * REWARD_PER_CORRECT);

  session.submitted = true;
  session.score = score;
  session.rewardAmount = rewardAmount;
  examSessions.set(input.sessionId, session);

  return {
    ok: true,
    score,
    totalQuestions: session.questions.length,
    rewardAmount,
    message: `Exam submitted. You got ${score}/10 correct.`
  };
}

export async function claimExamReward(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
}) {
  const session = examSessions.get(input.sessionId);

  if (!session) {
    return {
      ok: false,
      rewarded: false,
      message: "Exam session not found."
    };
  }

  if (!session.submitted || typeof session.score !== "number" || !session.rewardAmount) {
    return {
      ok: false,
      rewarded: false,
      message: "Submit the exam before claiming reward."
    };
  }

  if (session.score <= 0) {
    examSessions.delete(input.sessionId);
    return {
      ok: true,
      rewarded: false,
      score: 0,
      rewardAmount: "0.00000000",
      message: "No reward earned because there were no correct answers."
    };
  }

  const reward = await claimPuzzleReward({
    puzzleId: input.sessionId,
    walletAddress: input.walletAddress
  }).catch(() => null);

  if (reward?.ok) {
    examSessions.delete(input.sessionId);
    return {
      ok: true,
      rewarded: true,
      score: session.score,
      rewardAmount: session.rewardAmount,
      reward: reward.reward,
      message: `Reward sent: ${session.rewardAmount} GENI`
    };
  }

  return {
    ok: false,
    rewarded: false,
    message: "Exam reward payout could not be processed from current reward action."
  };
}

export async function claimExamRewardDirect(input: {
  sessionId: string;
  walletAddress: `0x${string}`;
}) {
  const session = examSessions.get(input.sessionId);

  if (!session) {
    return {
      ok: false,
      rewarded: false,
      message: "Exam session not found."
    };
  }

  if (!session.submitted || typeof session.score !== "number" || !session.rewardAmount) {
    return {
      ok: false,
      rewarded: false,
      message: "Submit the exam before claiming reward."
    };
  }

  if (session.score <= 0) {
    examSessions.delete(input.sessionId);
    return {
      ok: true,
      rewarded: false,
      score: 0,
      rewardAmount: "0.00000000",
      message: "No reward earned because there were no correct answers."
    };
  }

  const { awardGeniReward } = await import("@/lib/rewards");
  const reward = await awardGeniReward(input.walletAddress, session.rewardAmount);

  examSessions.delete(input.sessionId);

  return {
    ok: true,
    rewarded: true,
    score: session.score,
    rewardAmount: session.rewardAmount,
    reward,
    message: `Reward sent: ${session.rewardAmount} GENI`
  };
}

