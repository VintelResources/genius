'use server';
import { prisma } from '@/lib/prisma';

export async function getRandomWord() {
  const count = await prisma.word.count();
  const randomIndex = Math.floor(Math.random() * count);
  const [randomWord] = await prisma.word.findMany({
    skip: randomIndex,
    take: 1,
  });
  return randomWord;
}

