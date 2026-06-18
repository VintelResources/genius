'use server';
import { prisma } from '@/lib/prisma';

export async function addWordManually(word: string, hint: string) {
  try {
    return await prisma.word.create({
      data: { word: word.toUpperCase(), hint },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

