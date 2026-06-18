"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import {
  claimModuleExamReward,
  completeCourseLesson,
  generateLessonQuiz,
  getCatalog,
  getExamStatus,
  getProgress,
  startModuleExam,
  submitModuleExam
} from "@/actions/realCourses";
import { speakText, stopVoice } from "@/lib/voice";

type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

type ExamQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation?: string;
};

type ShuffledQuestion = {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type Course = {
  id: string;
  provider: string;
  providerUrl: string;
  band: LearnerBand;
  title: string;
  description: string;
  subject: string;
  sourceLabel: string;
  lessons: {
    id: string;
    title: string;
    summary: string;
    duration: string;
    lessonContent: string;
    keyPoints: string[];
    lessonVideoEmbedUrl?: string;
    lessonQuizTitle?: string;
    lessonQuizQuestions?: ExamQuestion[];
    moduleExamQuestions?: ExamQuestion[];
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

type ExamRecord = {
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
};

type LevelCurriculumProps = {
  level: LearnerBand;
  title: string;
  subtitle: string;
  showBackLink?: boolean;
};

const WRONG_ANSWER_AUDIO_SRC = "/audio/wrong-answer.mp3";
const CORRECT_ANSWER_AUDIO_SRC = "/audio/correct-answer.mp3";

function shuffleArray<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

async function playWrongAnswerSound(audio: HTMLAudioElement | null) {
  if (!audio) {
    return;
  }

  try {
    audio.volume = 0.7;
    audio.currentTime = 0;
    await audio.play();
  } catch {}
}

async function playCorrectAnswerSound(audio: HTMLAudioElement | null) {
  if (!audio) {
    return;
  }

  try {
    audio.volume = 0.7;
    audio.currentTime = 0;
    await audio.play();
  } catch {}
}

function buildQuestionSpeech(
  question: { prompt: string; options: string[] },
  index: number,
  total: number
) {
  return [
    `Question ${index + 1} of ${total}.`,
    question.prompt,
    `Option A. ${question.options[0]}.`,
    `Option B. ${question.options[1]}.`,
    `Option C. ${question.options[2]}.`,
    `Option D. ${question.options[3]}.`
  ].join(" ");
}

export default function LevelCurriculum({
  level,
  title,
  subtitle,
  showBackLink = true
}: LevelCurriculumProps) {
  const { address, isConnected } = useAccount();
  const wrongAnswerAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAnswerAudioRef = useRef<HTMLAudioElement | null>(null);

  const [catalog, setCatalog] = useState<BandedCatalog | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [startedCourseId, setStartedCourseId] = useState("");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [moduleExamSessionId, setModuleExamSessionId] = useState("");
  const [moduleExamCourseId, setModuleExamCourseId] = useState("");
  const [moduleExamLessonId, setModuleExamLessonId] = useState("");
  const [moduleExamTitle, setModuleExamTitle] = useState("");
  const [moduleExamLessonTitle, setModuleExamLessonTitle] = useState("");
  const [shuffledModuleQuestions, setShuffledModuleQuestions] = useState<ShuffledQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [moduleExamResult, setModuleExamResult] = useState<null | {
    score: number;
    totalQuestions: number;
    thresholdScore: number;
    passed: boolean;
    rewardAmount: string;
    review: TutorReviewItem[];
    questionResults: QuestionResult[];
  }>(null);
  const [lessonQuizQuestions, setLessonQuizQuestions] = useState<ShuffledQuestion[]>([]);
  const [lessonQuizAnswers, setLessonQuizAnswers] = useState<string[]>([]);
  const [lessonQuizResult, setLessonQuizResult] = useState<null | {
    score: number;
    totalQuestions: number;
    passed: boolean;
    thresholdScore: number;
    questionResults: QuestionResult[];
  }>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const loadedCatalog = await getCatalog();
      setCatalog(loadedCatalog);
    });
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const [loadedProgress, loadedExamStatus] = await Promise.all([
        getProgress(address),
        getExamStatus(address)
      ]);
      setProgress(loadedProgress);
      setExamRecords(loadedExamStatus);
    });
  }, [address]);

  const levelCourses = useMemo(() => {
    if (!catalog) return [];
    return catalog[level] ?? [];
  }, [catalog, level]);

  const subjects = useMemo(() => {
    return Array.from(new Set(levelCourses.map((course) => course.subject)));
  }, [levelCourses]);

  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const filteredCourses = useMemo(() => {
    if (!selectedSubject) return levelCourses;
    return levelCourses.filter((course) => course.subject === selectedSubject);
  }, [levelCourses, selectedSubject]);

  useEffect(() => {
    if (!selectedCourseId && filteredCourses.length > 0) {
      setSelectedCourseId(filteredCourses[0].id);
    }

    if (
      selectedCourseId &&
      filteredCourses.length > 0 &&
      !filteredCourses.some((course) => course.id === selectedCourseId)
    ) {
      setSelectedCourseId(filteredCourses[0].id);
    }
  }, [filteredCourses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => filteredCourses.find((course) => course.id === selectedCourseId) ?? null,
    [filteredCourses, selectedCourseId]
  );

  const startedCourse = useMemo(
    () => filteredCourses.find((course) => course.id === startedCourseId) ?? null,
    [filteredCourses, startedCourseId]
  );

  const selectedProgress = useMemo(() => {
    if (!startedCourse) return [];
    const key = `${(address?.toLowerCase() ?? "guest")}:${startedCourse.id}`;
    return progress.find((item) => item.key === key)?.completedLessonIds ?? [];
  }, [progress, startedCourse, address]);

  const activeLesson = useMemo(() => {
    if (!startedCourse || !activeLessonId) return null;
    return startedCourse.lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  }, [startedCourse, activeLessonId]);

  const lessonQuizTitle = useMemo(() => {
    if (!activeLesson) return "Lesson Quiz";
    return activeLesson.lessonQuizTitle ?? `${activeLesson.title} Lesson Quiz`;
  }, [activeLesson]);

  function getLessonExamRecord(courseId: string, lessonId: string) {
    return (
      examRecords.find(
        (record) => record.courseId === courseId && record.lessonId === lessonId && record.passed
      ) ?? null
    );
  }

  async function refreshLearnerState() {
    const [loadedProgress, loadedExamStatus] = await Promise.all([
      getProgress(address),
      getExamStatus(address)
    ]);
    setProgress(loadedProgress);
    setExamRecords(loadedExamStatus);
  }

  function clearExamPanel() {
    stopVoice();
    setModuleExamSessionId("");
    setModuleExamCourseId("");
    setModuleExamLessonId("");
    setModuleExamTitle("");
    setModuleExamLessonTitle("");
    setShuffledModuleQuestions([]);
    setAnswers([]);
    setModuleExamResult(null);
  }

  function resetLessonQuiz(questions: ShuffledQuestion[] = []) {
    stopVoice();
    setLessonQuizQuestions(questions);
    setLessonQuizAnswers(Array(questions.length).fill(""));
    setLessonQuizResult(null);
  }

  function buildShuffledQuestions(
    rawQuestions: { prompt: string; options: [string, string, string, string]; correctAnswer: string; explanation?: string }[]
  ) {
    return rawQuestions.slice(0, 10).map((question) => ({
      prompt: question.prompt,
      correctAnswer: question.correctAnswer,
      explanation:
        question.explanation ??
        `Tutor: "${question.correctAnswer}" is correct because it best matches the topic.`,
      options: shuffleArray([...question.options])
    }));
  }

  function readLessonQuizQuestion(index: number) {
    const question = lessonQuizQuestions[index];
    if (!voiceEnabled || !question) {
      return;
    }

    speakText(buildQuestionSpeech(question, index, lessonQuizQuestions.length));
  }

  function readModuleExamQuestion(index: number) {
    const question = shuffledModuleQuestions[index];
    if (!voiceEnabled || !question) {
      return;
    }

    speakText(buildQuestionSpeech(question, index, shuffledModuleQuestions.length));
  }

  function handleStartCourse() {
    if (!selectedCourseId) return;

    setStartedCourseId(selectedCourseId);
    setActiveLessonId("");
    clearExamPanel();
    resetLessonQuiz();
    setStatus("Course loaded.");
    setError("");
  }

  function openLesson(lessonId: string) {
    setActiveLessonId(lessonId);

    if (!startedCourse) {
      return;
    }

    startTransition(async () => {
      setError("");
      const response = await generateLessonQuiz({
        courseId: startedCourse.id,
        lessonId
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      resetLessonQuiz(
        buildShuffledQuestions(
          response.questions.map((item) => ({
            prompt: item.prompt,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation
          }))
        )
      );
      setStatus("AI learning path quiz generated.");
    });
  }

  function updateLessonQuizAnswer(index: number, value: string) {
    if (lessonQuizResult) {
      return;
    }

    setLessonQuizAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function submitLessonQuiz() {
    if (!lessonQuizQuestions.length) {
      return;
    }

    const questionResults = lessonQuizQuestions.map((question, index) => {
      const selectedAnswer = lessonQuizAnswers[index] ?? "";
      const isCorrect = selectedAnswer === question.correctAnswer;

      return {
        prompt: question.prompt,
        selectedAnswer: selectedAnswer || "No answer selected",
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = questionResults.filter((item) => item.isCorrect).length;
    const totalQuestions = questionResults.length;
    const thresholdScore = Math.ceil(totalQuestions * 0.8);

    setLessonQuizResult({
      score,
      totalQuestions,
      passed: score >= thresholdScore,
      thresholdScore,
      questionResults
    });
    setStatus("AI lesson quiz submitted.");
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
      await refreshLearnerState();
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

      const shuffled = response.questions.map((question: ModuleQuestion) => ({
        prompt: question.prompt,
        correctAnswer: "",
        explanation: "",
        options: shuffleArray([...question.options])
      }));

      setModuleExamSessionId(response.sessionId);
      setModuleExamCourseId(courseId);
      setModuleExamLessonId(lessonId);
      setModuleExamTitle(response.title);
      setModuleExamLessonTitle(response.lessonTitle);
      setShuffledModuleQuestions(shuffled);
      setAnswers(Array(response.questions.length).fill(""));
      setModuleExamResult(null);
      setStatus(`${response.lessonTitle} AI exam started.`);
    });
  }

  function handleRetakeQuiz() {
    if (!moduleExamCourseId || !moduleExamLessonId) {
      setError("No failed exam available to retry.");
      return;
    }

    const retryCourseId = moduleExamCourseId;
    const retryLessonId = moduleExamLessonId;

    clearExamPanel();
    handleStartModuleExam(retryCourseId, retryLessonId);
  }

  function updateAnswer(index: number, value: string) {
    if (moduleExamResult) {
      return;
    }

    setAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function handleSubmitModuleExam() {
    startTransition(async () => {
      setError("");

      const orderedAnswers = shuffledModuleQuestions.map((_, index) => {
        return answers[index] ?? "";
      });

      const response = await submitModuleExam({
        sessionId: moduleExamSessionId,
        answers: orderedAnswers,
        walletAddress: address
      });

      if (!response.ok) {
        setError("message" in response ? response.message ?? "Request failed." : "Request failed.");
        return;
      }

      setModuleExamResult({
        score: response.score,
        totalQuestions: response.totalQuestions,
        thresholdScore: response.thresholdScore,
        passed: response.passed,
        rewardAmount: response.rewardAmount,
        review: response.review ?? [],
        questionResults: response.questionResults ?? []
      });
      setStatus("message" in response ? response.message ?? "Request completed." : "Request completed.");
      await refreshLearnerState();
    });
  }

  function handleGetReward() {
    if (!moduleExamSessionId || !address) {
      setError("Connect your wallet before getting reward.");
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
      window.dispatchEvent(
        new CustomEvent("geni-wallet-credit", {
          detail: {
            amount: response.rewardAmount,
            source: "exam",
            categoryTitle: moduleExamLessonTitle
          }
        })
      );
      await refreshLearnerState();
      clearExamPanel();
    });
  }

  function getLessonQuestionResult(prompt: string) {
    return lessonQuizResult?.questionResults.find((item) => item.prompt === prompt) ?? null;
  }

  function getModuleQuestionResult(prompt: string) {
    return moduleExamResult?.questionResults.find((item) => item.prompt === prompt) ?? null;
  }

  function getOptionClass(
    option: string,
    selected: boolean,
    result: QuestionResult | null,
    defaultSelectedClass: string
  ) {
    if (!result) {
      return selected
        ? defaultSelectedClass
        : "border-white/10 bg-black/20 text-white/85";
    }

    if (option === result.correctAnswer) {
      return "border-emerald-300/40 bg-emerald-500/20 text-emerald-100";
    }

    if (option === result.selectedAnswer && !result.isCorrect) {
      return "border-red-300/40 bg-red-500/20 text-red-100";
    }

    return "border-white/10 bg-black/20 text-white/65";
  }

  useEffect(() => {
    if (!voiceEnabled || !lessonQuizQuestions.length || lessonQuizResult || !activeLessonId) {
      return;
    }

    const timer = window.setTimeout(() => {
      readLessonQuizQuestion(0);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [voiceEnabled, lessonQuizQuestions, lessonQuizResult, activeLessonId]);

  useEffect(() => {
    if (!voiceEnabled || !shuffledModuleQuestions.length || moduleExamResult || !moduleExamSessionId) {
      return;
    }

    const timer = window.setTimeout(() => {
      readModuleExamQuestion(0);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [voiceEnabled, shuffledModuleQuestions, moduleExamResult, moduleExamSessionId]);

  useEffect(() => {
    if (!lessonQuizResult) {
      return;
    }

    const firstCorrect = lessonQuizResult.questionResults.find((item) => item.isCorrect);
    const firstWrong = lessonQuizResult.questionResults.find((item) => !item.isCorrect);

    if (firstCorrect) {
      void playCorrectAnswerSound(correctAnswerAudioRef.current);

      if (voiceEnabled) {
        speakText(
          `Correct answer. ${firstCorrect.correctAnswer}. ${firstCorrect.explanation}`
        );
      }

      return;
    }

    if (firstWrong) {
      void playWrongAnswerSound(wrongAnswerAudioRef.current);

      if (voiceEnabled) {
        speakText(
          `Wrong answer. The correct answer is ${firstWrong.correctAnswer}. ${firstWrong.explanation}`
        );
      }
    }
  }, [lessonQuizResult, voiceEnabled]);

  useEffect(() => {
    if (!moduleExamResult) {
      return;
    }

    const firstCorrect = moduleExamResult.questionResults.find((item) => item.isCorrect);
    const firstWrong = moduleExamResult.questionResults.find((item) => !item.isCorrect);

    if (firstCorrect) {
      void playCorrectAnswerSound(correctAnswerAudioRef.current);

      if (voiceEnabled) {
        speakText(
          `Correct answer. ${firstCorrect.correctAnswer}. ${firstCorrect.explanation}`
        );
      }

      return;
    }

    if (firstWrong) {
      void playWrongAnswerSound(wrongAnswerAudioRef.current);

      if (voiceEnabled) {
        speakText(
          `Wrong answer. The correct answer is ${firstWrong.correctAnswer}. ${firstWrong.explanation}`
        );
      }
    }
  }, [moduleExamResult, voiceEnabled]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  return (
    <div className="space-y-6">
      <audio ref={wrongAnswerAudioRef} src={WRONG_ANSWER_AUDIO_SRC} preload="auto" />
      <audio ref={correctAnswerAudioRef} src={CORRECT_ANSWER_AUDIO_SRC} preload="auto" />

      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
              {title}
            </div>
            <h1 className="mt-3 text-4xl font-black text-white">{subtitle}</h1>
            <p className="mt-2 text-sm text-white/70">
              AI now generates fresh lesson, path, and exam questions based on learner level and subject.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setVoiceEnabled((current) => !current)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
            >
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </button>

            {showBackLink ? (
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
              >
                â† Back
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const active = subject === selectedSubject;

            return (
              <button
                key={subject}
                type="button"
                onClick={() => {
                  stopVoice();
                  setSelectedSubject(subject);
                  setSelectedCourseId("");
                  setStartedCourseId("");
                  setActiveLessonId("");
                  resetLessonQuiz();
                  clearExamPanel();
                }}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/75"
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
        <section className="space-y-4">
          {filteredCourses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`w-full rounded-[28px] border p-6 text-left backdrop-blur-xl transition ${
                selectedCourseId === course.id
                  ? "border-cyan-300/30 bg-cyan-400/10"
                  : "border-white/15 bg-white/10"
              }`}
            >
              <div className="font-semibold text-white">{course.title}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200/80">
                {course.provider} â€¢ {course.subject}
              </div>
              <div className="mt-2 text-sm text-white/70">{course.description}</div>
            </button>
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
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                      Course Progress
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {selectedProgress.length}/{startedCourse.lessons.length}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {startedCourse.lessons.map((lesson) => {
                      const done = selectedProgress.includes(lesson.id);
                      const isActive = activeLessonId === lesson.id;
                      const examRecord = getLessonExamRecord(startedCourse.id, lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
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
                              {examRecord?.passed ? (
                                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                                  Passed {examRecord.score}/{examRecord.totalQuestions}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => openLesson(lesson.id)}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                              >
                                Open Lesson
                              </button>

                              <button
                                type="button"
                                disabled={done || isPending}
                                onClick={() => markLessonComplete(startedCourse.id, lesson.id)}
                                className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 disabled:opacity-50"
                              >
                                {done ? "Completed" : "Complete Lesson"}
                              </button>

                              {examRecord?.passed ? (
                                <button
                                  type="button"
                                  disabled
                                  className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-100 opacity-80"
                                >
                                  Passed
                                </button>
                              ) : done ? (
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

                  {activeLesson ? (
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5 space-y-5">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                          Open Lesson
                        </div>
                        <h3 className="mt-2 text-2xl font-bold text-white">{activeLesson.title}</h3>
                      </div>

                      {lessonQuizQuestions.length === 10 ? (
                        <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-white">{lessonQuizTitle}</div>
                            <div className="flex flex-wrap gap-2">
                              <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
                                10 AI Questions
                              </div>
                              <button
                                type="button"
                                onClick={() => readLessonQuizQuestion(0)}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                              >
                                Read Quiz
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            {lessonQuizQuestions.map((question, index) => {
                              const result = getLessonQuestionResult(question.prompt);

                              return (
                                <div
                                  key={`${question.prompt}-${index}`}
                                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="font-medium text-white">
                                      {index + 1}. {question.prompt}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => readLessonQuizQuestion(index)}
                                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                                    >
                                      Read
                                    </button>
                                  </div>

                                  <div className="mt-3 grid gap-2">
                                    {question.options.map((option) => {
                                      const selected = lessonQuizAnswers[index] === option;

                                      return (
                                        <button
                                          key={option}
                                          type="button"
                                          onClick={() => updateLessonQuizAnswer(index, option)}
                                          disabled={!!lessonQuizResult}
                                          className={`rounded-xl border px-4 py-3 text-left text-sm transition ${getOptionClass(
                                            option,
                                            selected,
                                            result,
                                            "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100"
                                          )}`}
                                        >
                                          {option}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {result && !result.isCorrect ? (
                                    <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                      {result.explanation}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>

                          {!lessonQuizResult ? (
                            <button
                              type="button"
                              onClick={submitLessonQuiz}
                              disabled={
                                lessonQuizAnswers.length !== 10 ||
                                lessonQuizAnswers.some((answer) => !answer)
                              }
                              className="mt-4 w-full rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-5 py-3 font-medium text-fuchsia-100 disabled:opacity-50"
                            >
                              Submit Lesson Quiz
                            </button>
                          ) : lessonQuizResult.passed ? (
                            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                              <div className="text-xs uppercase tracking-[0.25em] text-emerald-100">
                                Lesson Quiz Passed
                              </div>
                              <div className="mt-2 text-3xl font-black text-white">
                                {lessonQuizResult.score}/{lessonQuizResult.totalQuestions}
                              </div>
                              <div className="mt-2 text-white/85">
                                Threshold: {lessonQuizResult.thresholdScore}/{lessonQuizResult.totalQuestions}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                              <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                                Below Threshold
                              </div>
                              <div className="mt-2 text-3xl font-black text-white">
                                {lessonQuizResult.score}/{lessonQuizResult.totalQuestions}
                              </div>
                              <div className="mt-2 text-white/85">
                                Threshold: {lessonQuizResult.thresholdScore}/{lessonQuizResult.totalQuestions}
                              </div>
                              <button
                                type="button"
                                onClick={() => openLesson(activeLesson.id)}
                                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                              >
                                Retake Quiz
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-white/85">{activeLesson.lessonContent}</p>

                          <div>
                            <div className="text-sm font-semibold text-white">Key Points</div>
                            <div className="mt-2 grid gap-2">
                              {activeLesson.keyPoints.map((point) => (
                                <div
                                  key={point}
                                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                                >
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}

                  {moduleExamSessionId ? (
                    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
                        Take Exam
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{moduleExamTitle}</h3>
                          <div className="text-sm text-white/70">{moduleExamLessonTitle}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => readModuleExamQuestion(0)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                        >
                          Read Exam
                        </button>
                      </div>

                      <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                        AI-generated exam â€¢ Score 80% or above to earn 0.01 G.
                      </div>

                      {shuffledModuleQuestions.map((question, index) => {
                        const result = getModuleQuestionResult(question.prompt);

                        return (
                          <div
                            key={question.prompt}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-medium text-white">
                                {index + 1}. {question.prompt}
                              </div>
                              <button
                                type="button"
                                onClick={() => readModuleExamQuestion(index)}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                              >
                                Read
                              </button>
                            </div>

                            <div className="mt-3 grid gap-2">
                              {question.options.map((option) => {
                                const selected = answers[index] === option;

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => updateAnswer(index, option)}
                                    disabled={!!moduleExamResult}
                                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${getOptionClass(
                                      option,
                                      selected,
                                      result,
                                      "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                                    )}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {result && !result.isCorrect ? (
                              <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                {result.explanation}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      {!moduleExamResult ? (
                        <button
                          type="button"
                          onClick={handleSubmitModuleExam}
                          disabled={
                            isPending ||
                            shuffledModuleQuestions.length !== 10 ||
                            answers.length !== 10 ||
                            answers.some((answer) => !answer)
                          }
                          className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                        >
                          Submit Module Exam
                        </button>
                      ) : moduleExamResult.passed ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                            <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                              Passed
                            </div>
                            <div className="mt-2 text-3xl font-black text-white">
                              {moduleExamResult.score}/{moduleExamResult.totalQuestions}
                            </div>
                            <div className="mt-2 text-white/85">
                              Threshold: {moduleExamResult.thresholdScore}/{moduleExamResult.totalQuestions}
                            </div>
                            <div className="mt-2 text-white/85">
                              Fixed reward unlocked: 0.01 GENI
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleGetReward}
                            disabled={!isConnected || isPending}
                            className="w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-50"
                          >
                            Claim 0.01 G
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                            <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                              Below Threshold
                            </div>
                            <div className="mt-2 text-3xl font-black text-white">
                              {moduleExamResult.score}/{moduleExamResult.totalQuestions}
                            </div>
                            <div className="mt-2 text-white/85">
                              Threshold: {moduleExamResult.thresholdScore}/{moduleExamResult.totalQuestions}
                            </div>
                            <div className="mt-2 text-white/85">
                              You did not reach 80%, so reward is locked.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRetakeQuiz}
                            disabled={isPending}
                            className="w-full rounded-2xl border border-amber-300/20 bg-amber-400/10 px-5 py-3 font-medium text-amber-50 disabled:opacity-50"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : (
            <div className="text-white/50">Select a subject course to begin.</div>
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
  );
}





