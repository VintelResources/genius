'use server';

import { ExamResult } from './types';

export async function saveExamResult(userId: string, result: ExamResult) {
  return {
    id: crypto.randomUUID(),
    userId,
    subject: result.subject ?? '',
    category: result.category ?? '',
    score: result.score ?? 0,
    totalQuestions: result.totalQuestions ?? 0,
    percentage: result.percentage ?? 0,
    passed: result.passed ?? false,
    createdAt: new Date()
  };
}

