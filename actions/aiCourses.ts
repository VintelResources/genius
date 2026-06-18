"use server";

import {
  generateAiCourses,
  type AiGeneratedCourse,
  type LearnerBand
} from "@/lib/ai-course-engine";

export async function getAiCourses(input?: {
  learnerBand?: LearnerBand | "all";
  subject?: string | "all";
  courseCount?: number;
}): Promise<{
  ok: true;
  courses: AiGeneratedCourse[];
}> {
  const courses = await generateAiCourses(input);

  return {
    ok: true,
    courses
  };
}

