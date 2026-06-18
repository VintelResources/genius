"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import {
  claimExamRewardDirect,
  completeLesson,
  getLearnerCourseState,
  listCourses,
  startCourseExam,
  submitCourseExam
} from "@/actions/courseExam";

type Course = {
  id: string;
  title: string;
  topic: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    content: string;
  }[];
};

type CourseState = {
  courseId: string;
  completedLessonIds: string[];
  completedCount: number;
  totalLessons: number;
  examUnlocked: boolean;
};

type ExamQuestion = {
  index: number;
  prompt: string;
  hint: string;
};

export default function CourseExamSystem() {
  const { address, isConnected } = useAccount();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStates, setCourseStates] = useState<CourseState[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [examSessionId, setExamSessionId] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [examResult, setExamResult] = useState<{
    score: number;
    totalQuestions: number;
    rewardAmount: string;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const loadedCourses = await listCourses();
      setCourses(loadedCourses);
      setSelectedCourseId((current) => current || loadedCourses[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const state = await getLearnerCourseState(address);
      setCourseStates(state);
    });
  }, [address]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const selectedState = useMemo(
    () => courseStates.find((item) => item.courseId === selectedCourseId) ?? null,
    [courseStates, selectedCourseId]
  );

  function refreshState() {
    startTransition(async () => {
      const state = await getLearnerCourseState(address);
      setCourseStates(state);
    });
  }

  function handleCompleteLesson(courseId: string, lessonId: string) {
    startTransition(async () => {
      setError("");
      const response = await completeLesson({
        courseId,
        lessonId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
      refreshState();
    });
  }

  function handleStartExam() {
    if (!selectedCourseId) return;

    startTransition(async () => {
      setError("");
      setStatus("");

      const response = await startCourseExam({
        courseId: selectedCourseId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setExamSessionId(response.sessionId);
      setExamTitle(response.courseTitle);
      setExamQuestions(response.questions);
      setAnswers(Array(10).fill(""));
      setExamResult(null);
      setStatus("Exam started. Answer all 10 questions.");
    });
  }

  function handleChangeAnswer(index: number, value: string) {
    setAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function handleSubmitExam() {
    startTransition(async () => {
      setError("");
      setStatus("");

      const response = await submitCourseExam({
        sessionId: examSessionId,
        answers,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setExamResult({
        score: response.score,
        totalQuestions: response.totalQuestions,
        rewardAmount: response.rewardAmount
      });
      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
    });
  }

  function handleClaimExamReward() {
    if (!examSessionId || !address) {
      setError("Connect your wallet before claiming reward.");
      return;
    }

    startTransition(async () => {
      setError("");
      const response = await claimExamRewardDirect({
        sessionId: examSessionId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
      setExamSessionId("");
      setExamQuestions([]);
      setAnswers(Array(10).fill(""));
      setExamResult(null);
    });
  }

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
            Courses + Exams
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">
            Complete Courses. Then Take a 10-Question Exam.
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Reward = number of correct answers × 0.00000001 GENI.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <label className="mb-3 block text-sm text-white/75">Choose Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="text-black">
                  {course.title}
                </option>
              ))}
            </select>

            {selectedCourse ? (
              <div className="mt-5 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
                  <p className="mt-2 text-sm text-white/70">{selectedCourse.description}</p>
                </div>

                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                    Progress
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {selectedState?.completedCount ?? 0}/{selectedState?.totalLessons ?? selectedCourse.lessons.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCourse.lessons.map((lesson) => {
                    const done = selectedState?.completedLessonIds.includes(lesson.id) ?? false;

                    return (
                      <div
                        key={lesson.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">{lesson.title}</div>
                            <div className="mt-2 text-sm text-white/70">{lesson.content}</div>
                          </div>

                          <button
                            type="button"
                            disabled={done || isPending}
                            onClick={() => handleCompleteLesson(selectedCourse.id, lesson.id)}
                            className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 disabled:opacity-50"
                          >
                            {done ? "Completed" : "Mark Complete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!selectedState?.examUnlocked || isPending}
                  onClick={handleStartExam}
                  className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                >
                  Start 10-Question Exam
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            {!examSessionId ? (
              <div className="flex min-h-[400px] items-center justify-center text-white/50">
                Finish a course and start the exam to see questions here.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
                    Active Exam
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-white">{examTitle}</h2>
                </div>

                {examQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-sm font-semibold text-white">
                      Question {index + 1}
                    </div>
                    <div className="mt-2 text-white/85">{question.prompt}</div>
                    <div className="mt-2 text-sm text-cyan-200/80">
                      Hint: {question.hint}
                    </div>
                    <input
                      value={answers[index] ?? ""}
                      onChange={(e) => handleChangeAnswer(index, e.target.value)}
                      placeholder="Type your answer"
                      className="mt-3 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                ))}

                {!examResult ? (
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    disabled={isPending || answers.some((answer) => !answer.trim())}
                    className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                  >
                    Submit Exam
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
                        Exam Result
                      </div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {examResult.score}/{examResult.totalQuestions}
                      </div>
                      <div className="mt-2 text-white/85">
                        Total reward: {examResult.rewardAmount} GENI
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClaimExamReward}
                      disabled={!isConnected || isPending}
                      className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                    >
                      Claim Total Exam Reward
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {status ? (
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {status}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}


