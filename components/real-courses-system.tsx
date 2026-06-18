"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import {
  claimModuleExamReward,
  completeCourseLesson,
  getCatalog,
  getProgress,
  startModuleExam,
  submitModuleExam
} from "@/actions/realCourses";

type Course = {
  id: string;
  provider: string;
  providerUrl: string;
  band: string;
  title: string;
  description: string;
  subject: string;
  sourceLabel: string;
  youtubeVideoId?: string;
  lessons: {
    id: string;
    title: string;
    summary: string;
    duration: string;
    openLessonUrl: string;
    openLessonLabel: string;
  }[];
};

type BandedCatalog = {
  toddlers: Course[];
  primary: Course[];
  secondary: Course[];
  tertiary: Course[];
};

type ProgressItem = {
  key: string;
  completedLessonIds: string[];
};

type ModuleQuestion = {
  index: number;
  prompt: string;
  options: [string, string, string, string];
};

export default function RealCoursesSystem() {
  const { address, isConnected } = useAccount();
  const [catalog, setCatalog] = useState<BandedCatalog | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [startedCourseId, setStartedCourseId] = useState("");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [moduleExamSessionId, setModuleExamSessionId] = useState("");
  const [moduleExamTitle, setModuleExamTitle] = useState("");
  const [moduleExamLessonTitle, setModuleExamLessonTitle] = useState("");
  const [moduleQuestions, setModuleQuestions] = useState<ModuleQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [moduleExamResult, setModuleExamResult] = useState<null | {
    score: number;
    totalQuestions: number;
    rewardAmount: string;
  }>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const loadedCatalog = await getCatalog();
      setCatalog(loadedCatalog as unknown as BandedCatalog);

      const firstCourse =
        loadedCatalog.toddlers[0]?.id ||
        loadedCatalog.primary[0]?.id ||
        loadedCatalog.secondary[0]?.id ||
        loadedCatalog.tertiary[0]?.id ||
        "";

      setSelectedCourseId(firstCourse);
    });
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const loadedProgress = await getProgress(address);
      setProgress(loadedProgress);
    });
  }, [address]);

  const allCourses = useMemo(() => {
    if (!catalog) return [];
    return [...catalog.toddlers, ...catalog.primary, ...catalog.secondary, ...catalog.tertiary];
  }, [catalog]);

  const selectedCourse = useMemo(
    () => allCourses.find((course) => course.id === selectedCourseId) ?? null,
    [allCourses, selectedCourseId]
  );

  const startedCourse = useMemo(
    () => allCourses.find((course) => course.id === startedCourseId) ?? null,
    [allCourses, startedCourseId]
  );

  const selectedProgress = useMemo(() => {
    if (!startedCourse) return [];
    const key = `${(address?.toLowerCase() ?? "guest")}:${startedCourse.id}`;
    return progress.find((item) => item.key === key)?.completedLessonIds ?? [];
  }, [progress, startedCourse, address]);

  async function refreshProgress() {
    const loadedProgress = await getProgress(address);
    setProgress(loadedProgress);
  }

  function handleStartCourse() {
    if (!selectedCourseId) return;

    setStartedCourseId(selectedCourseId);
    setActiveLessonId("");
    setModuleExamSessionId("");
    setModuleExamTitle("");
    setModuleExamLessonTitle("");
    setModuleQuestions([]);
    setAnswers([]);
    setModuleExamResult(null);
    setStatus("Course loaded. Each completed lesson unlocks its own multiple choice exam.");
    setError("");
  }

  function openLesson(lessonId: string, lessonUrl: string) {
    setActiveLessonId(lessonId);
    setStatus("Lesson opened.");
    setError("");
    window.open(lessonUrl, "_blank", "noopener,noreferrer");
  }

  function markLessonComplete(courseId: string, lessonId: string) {
    startTransition(async () => {
      setError("");
      const response = await completeCourseLesson({
        courseId,
        lessonId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
      await refreshProgress();
    });
  }

  function handleStartModuleExam(courseId: string, lessonId: string) {
    startTransition(async () => {
      setError("");
      const response = await startModuleExam({
        courseId,
        lessonId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setModuleExamSessionId(response.sessionId);
      setModuleExamTitle(response.title);
      setModuleExamLessonTitle(response.lessonTitle);
      setModuleQuestions(response.questions);
      setAnswers(Array(response.questions.length).fill(""));
      setModuleExamResult(null);
      setStatus(`${response.lessonTitle} exam started.`);
    });
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function handleSubmitModuleExam() {
    startTransition(async () => {
      setError("");
      const response = await submitModuleExam({
        sessionId: moduleExamSessionId,
        answers
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setModuleExamResult({
        score: response.score,
        totalQuestions: response.totalQuestions,
        rewardAmount: response.rewardAmount
      });
      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
    });
  }

  function handleClaimReward() {
    if (!moduleExamSessionId || !address) {
      setError("Connect your wallet before claiming reward.");
      return;
    }

    startTransition(async () => {
      setError("");
      const response = await claimModuleExamReward({
        sessionId: moduleExamSessionId,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
      setModuleExamSessionId("");
      setModuleExamTitle("");
      setModuleExamLessonTitle("");
      setModuleQuestions([]);
      setAnswers([]);
      setModuleExamResult(null);
    });
  }

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
            Real Courses
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">
            Start a Real Course. Complete Modules. Take Multiple Choice Module Exams.
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Each completed lesson unlocks a 4-option exam. Reward = correct answers × 0.00000001 GENI.
          </p>
        </section>

        {catalog ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            <section className="space-y-6">
              {(["toddlers", "primary", "secondary", "tertiary"] as const).map((band) => (
                <div key={band} className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{band}</div>
                  <div className="mt-4 space-y-3">
                    {catalog[band].map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selectedCourseId === course.id
                            ? "border-cyan-300/30 bg-cyan-400/10"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <div className="font-semibold text-white">{course.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200/80">
                          {course.provider} • {course.subject}
                        </div>
                        <div className="mt-2 text-sm text-white/70">{course.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              {selectedCourse ? (
                <div className="space-y-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                      {selectedCourse.sourceLabel}
                    </div>
                    <h2 className="mt-2 text-3xl font-black text-white">{selectedCourse.title}</h2>
                    <p className="mt-2 text-white/70">{selectedCourse.description}</p>
                    <a
                      href={selectedCourse.providerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block break-all text-sm text-cyan-200 underline"
                    >
                      Source: {selectedCourse.providerUrl}
                    </a>
                  </div>

                  {!startedCourse || startedCourse.id !== selectedCourse.id ? (
                    <button
                      type="button"
                      onClick={handleStartCourse}
                      className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white"
                    >
                      Start Course
                    </button>
                  ) : null}

                  {startedCourse && startedCourse.id === selectedCourse.id ? (
                    <>
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Course Progress</div>
                        <div className="mt-2 text-3xl font-black text-white">
                          {selectedProgress.length}/{startedCourse.lessons.length}
                        </div>
                      </div>

                      {startedCourse.youtubeVideoId ? (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/80">Video Lesson</div>
                          <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-white/10">
                            <iframe
                              src={`https://www.youtube.com/embed/${startedCourse.youtubeVideoId}`}
                              title={startedCourse.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {startedCourse.lessons.map((lesson) => {
                          const done = selectedProgress.includes(lesson.id);
                          const isActive = activeLessonId === lesson.id;

                          return (
                            <div key={lesson.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-semibold text-white">{lesson.title}</div>
                                  <div className="mt-2 text-sm text-white/70">{lesson.summary}</div>
                                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                                    Duration: {lesson.duration}
                                  </div>
                                  {isActive ? (
                                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                                      Opened lesson
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex flex-col gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openLesson(lesson.id, lesson.openLessonUrl)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                                  >
                                    {lesson.openLessonLabel}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={done || isPending}
                                    onClick={() => markLessonComplete(startedCourse.id, lesson.id)}
                                    className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 disabled:opacity-50"
                                  >
                                    {done ? "Completed" : "Complete Lesson"}
                                  </button>

                                  {done ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStartModuleExam(startedCourse.id, lesson.id)}
                                      className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-2 text-xs font-medium text-fuchsia-100"
                                    >
                                      Take Module Exam
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {moduleExamSessionId ? (
                        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">Module Exam</div>
                          <h3 className="text-2xl font-bold text-white">{moduleExamTitle}</h3>
                          <div className="text-sm text-white/70">{moduleExamLessonTitle}</div>

                          {moduleQuestions.map((question) => (
                            <div key={question.index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="font-medium text-white">
                                {question.index + 1}. {question.prompt}
                              </div>

                              <div className="mt-3 grid gap-2">
                                {question.options.map((option) => {
                                  const selected = answers[question.index] === option;

                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => updateAnswer(question.index, option)}
                                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                                        selected
                                          ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                                          : "border-white/10 bg-black/20 text-white/85"
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {!moduleExamResult ? (
                            <button
                              type="button"
                              onClick={handleSubmitModuleExam}
                              disabled={isPending || answers.some((answer) => !answer)}
                              className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                            >
                              Submit Module Exam
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Result</div>
                                <div className="mt-2 text-3xl font-black text-white">
                                  {moduleExamResult.score}/{moduleExamResult.totalQuestions}
                                </div>
                                <div className="mt-2 text-white/80">
                                  Module reward: {moduleExamResult.rewardAmount} GENI
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleClaimReward}
                                disabled={!isConnected || isPending}
                                className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                              >
                                Claim Module Reward
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="text-white/50">Select a course to begin.</div>
              )}
            </section>
          </div>
        ) : null}

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



