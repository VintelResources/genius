'use server';

import { UserProfile, ExamResult } from './types';

export async function submitExamResult(result: ExamResult): Promise<{ success: boolean; message: string }> {
  console.log('Exam result submitted:', result);

  return {
    success: true,
    message: 'Exam result submitted successfully.'
  };
}

export async function updateUserExperience(userId: string, points: number): Promise<UserProfile> {
  return {
    id: userId,
    name: 'User',
    level: 1,
    experience: points,
    geniusTokens: 0,
    btcBalance: 0,
    ethBalance: 0,
    solBalance: 0,
    usdcBalance: 0,
    transactions: []
  };
}
