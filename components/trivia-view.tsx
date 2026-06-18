"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import { generateTriviaQuestions } from "@/actions/aiQuestions";
import { claimTriviaReward } from "@/actions/triviaRewards";

type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

type TriviaCategoryKey =
  | "early-learning"
  | "english"
  | "science"
  | "history"
  | "geography"
  | "physics"
  | "chemistry"
  | "accounts"
  | "economics"
  | "forex"
  | "engineering"
  | "communication"
  | "politics"
  | "current-affairs";

type TriviaQuestion = {
  prompt: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
};

type TriviaCategory = {
  key: TriviaCategoryKey;
  title: string;
  subtitle: string;
  learnerBand: LearnerBand;
  subject: string;
  topic: string;
};

const TRIVIA_CATEGORIES: TriviaCategory[] = [
  {
    key: "early-learning",
    title: "Early Learning",
    subtitle: "Shapes, colors, animals, letters, counting, and simple daily life.",
    learnerBand: "toddlers",
    subject: "Early Learning",
    topic: "Shapes, colors, animals, letters, counting, simple daily life"
  },
  {
    key: "english",
    title: "English",
    subtitle: "Grammar, spelling, vocabulary, reading, and comprehension.",
    learnerBand: "primary",
    subject: "English",
    topic: "Grammar, vocabulary, spelling, sentence structure, reading comprehension"
  },
  {
    key: "science",
    title: "Science",
    subtitle: "Living things, matter, energy, health, and nature.",
    learnerBand: "secondary",
    subject: "Science",
    topic: "Biology, matter, energy, ecosystems, human body, scientific thinking"
  },
  {
    key: "history",
    title: "History",
    subtitle: "People, events, civilizations, independence, and timelines.",
    learnerBand: "secondary",
    subject: "History",
    topic: "World history, African history, Zambian history, independence, leaders, civilizations"
  },
  {
    key: "geography",
    title: "Geography",
    subtitle: "Maps, climate, rivers, landforms, and resources.",
    learnerBand: "secondary",
    subject: "Geography",
    topic: "Maps, continents, countries, climate, rivers, natural resources, settlements"
  },
  {
    key: "physics",
    title: "Physics",
    subtitle: "Forces, motion, electricity, light, heat, and energy.",
    learnerBand: "tertiary",
    subject: "Physics",
    topic: "Motion, force, energy, electricity, waves, light, heat, pressure"
  },
  {
    key: "chemistry",
    title: "Chemistry",
    subtitle: "Atoms, reactions, acids, bases, compounds, and lab basics.",
    learnerBand: "tertiary",
    subject: "Chemistry",
    topic: "Atoms, elements, compounds, reactions, acids and bases, mixtures, lab safety"
  },
  {
    key: "accounts",
    title: "Accounts",
    subtitle: "Ledgers, profit, loss, assets, liabilities, and records.",
    learnerBand: "tertiary",
    subject: "Accounts",
    topic: "Bookkeeping, ledgers, trial balance, profit and loss, assets, liabilities"
  },
  {
    key: "economics",
    title: "Economics",
    subtitle: "Markets, demand, supply, inflation, production, and money.",
    learnerBand: "tertiary",
    subject: "Economics",
    topic: "Demand, supply, inflation, markets, production, scarcity, money, trade"
  },
  {
    key: "forex",
    title: "Forex and Markets",
    subtitle: "Currencies, exchange rates, charts, trends, and risk.",
    learnerBand: "tertiary",
    subject: "Forex and Markets",
    topic: "Currency pairs, exchange rates, charts, trends, risk management, market sessions"
  },
  {
    key: "engineering",
    title: "Engineering",
    subtitle: "Design, machines, structures, systems, and problem solving.",
    learnerBand: "tertiary",
    subject: "Engineering",
    topic: "Structures, machines, materials, design thinking, circuits, systems, safety"
  },
  {
    key: "communication",
    title: "Communication Skills",
    subtitle: "Speaking, writing, listening, interviews, and presentations.",
    learnerBand: "secondary",
    subject: "Communication Skills",
    topic: "Public speaking, listening, writing, presentations, interviews, formal communication"
  },
  {
    key: "politics",
    title: "Politics",
    subtitle: "Government, democracy, citizenship, elections, and leadership.",
    learnerBand: "secondary",
    subject: "Politics",
    topic: "Government, democracy, elections, citizenship, constitution, leadership"
  },
  {
    key: "current-affairs",
    title: "Current Affairs",
    subtitle: "Recent public issues, technology, climate, economy, and society.",
    learnerBand: "secondary",
    subject: "Current Affairs",
    topic: "Recent events, public issues, economy, technology, climate, society"
  }
];

const REWARD_PER_TRIVIA_CORRECT =
  Number.parseFloat(process.env.NEXT_PUBLIC_TRIVIA_REWARD_PER_CORRECT ?? "") ||
  0.00000001;

const CORRECT_ANSWER_AUDIO_SRC = "/audio/correct-answer.mp3";
const WRONG_ANSWER_AUDIO_SRC = "/audio/wrong-answer.mp3";

function formatReward(score: number) {
  return (score * REWARD_PER_TRIVIA_CORRECT).toFixed(8);
}

function buildQuestionSpeech(question: TriviaQuestion, index: number, total: number) {
  return [
    `Question ${index + 1} of ${total}.`,
    question.prompt,
    `Option A. ${question.options[0]}.`,
    `Option B. ${question.options[1]}.`,
    `Option C. ${question.options[2]}.`,
    `Option D. ${question.options[3]}.`
  ].join(" ");
}

export default function TriviaView() {
  const { address, isConnected } = useAccount();

  const correctAnswerAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAnswerAudioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedCategoryKey, setSelectedCategoryKey] =
    useState<TriviaCategoryKey>("early-learning");
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [status, setStatus] = useState("Choose a level and subject to generate fresh AI trivia.");
  const [sessionId, setSessionId] = useState("");
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isClaimingReward, startClaimTransition] = useTransition();

  const selectedCategory = useMemo(() => {
    return (
      TRIVIA_CATEGORIES.find((category) => category.key === selectedCategoryKey) ??
      TRIVIA_CATEGORIES[0]
    );
  }, [selectedCategoryKey]);

  const finished = started && questionIndex >= questions.length;
  const currentQuestion = !finished ? questions[questionIndex] ?? null : null;
  const isLastQuestion = !finished && questionIndex === questions.length - 1;
  const isCorrect = !!currentQuestion && submitted && selectedAnswer === currentQuestion.answer;
  const rewardAmount = useMemo(() => formatReward(score), [score]);
  const hasTriviaReward = finished && score > 0;

  function speakTriviaText(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate =
      selectedCategory.learnerBand === "toddlers"
        ? 0.82
        : selectedCategory.learnerBand === "primary"
          ? 0.9
          : 1;

    utterance.pitch = selectedCategory.learnerBand === "toddlers" ? 1.15 : 1;
    window.speechSynthesis.speak(utterance);
  }

  function stopTriviaVoice() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  async function playCorrectAnswerSound() {
    try {
      if (!correctAnswerAudioRef.current) return;
      correctAnswerAudioRef.current.currentTime = 0;
      correctAnswerAudioRef.current.volume = 0.85;
      await correctAnswerAudioRef.current.play();
    } catch {}
  }

  async function playWrongAnswerSound() {
    try {
      if (!wrongAnswerAudioRef.current) return;
      wrongAnswerAudioRef.current.currentTime = 0;
      wrongAnswerAudioRef.current.volume = 0.85;
      await wrongAnswerAudioRef.current.play();
    } catch {}
  }

  function readCurrentQuestion() {
    if (!currentQuestion) return;
    speakTriviaText(buildQuestionSpeech(currentQuestion, questionIndex, questions.length));
  }

  function resetTrivia() {
    stopTriviaVoice();
    setStarted(false);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setSubmitted(false);
    setScore(0);
    setQuestions([]);
    setSessionId("");
    setRewardClaimed(false);
    setClaimMessage("");
    setStatus("Choose a level and subject to generate fresh AI trivia.");
  }

  function submitAnswer() {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    if (selectedAnswer === currentQuestion.answer) {
      setScore((current) => current + 1);
    }

    setSubmitted(true);
  }

  function goNext() {
    stopTriviaVoice();

    if (!currentQuestion) {
      return;
    }

    if (isLastQuestion) {
      setQuestionIndex(questions.length);
      setSelectedAnswer("");
      setSubmitted(false);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
    setSubmitted(false);
  }

  function startTrivia() {
    startTransition(async () => {
      setStatus("Generating fresh AI trivia...");
      setClaimMessage("");
      setRewardClaimed(false);

      const response = await generateTriviaQuestions({
        learnerBand: selectedCategory.learnerBand,
        subject: selectedCategory.subject,
        topic: selectedCategory.topic,
        categoryTitle: selectedCategory.title,
        walletAddress: address
      });

      if (!response.ok) {
        setStatus("message" in response ? response.message ?? "Unable to start trivia session." : "Unable to start trivia session.");
        return;
      }

      const generatedQuestions = "questions" in response ? response.questions : [];
      const nextQuestions: TriviaQuestion[] = generatedQuestions.map((item) => ({
        prompt: item.prompt,
        options: item.options,
        answer: item.correctAnswer,
        explanation: item.explanation
      }));

      setQuestions(nextQuestions);
      setSessionId(response.sessionId);
      setStarted(true);
      setQuestionIndex(0);
      setSelectedAnswer("");
      setSubmitted(false);
      setScore(0);
      setStatus(`AI trivia ready: ${selectedCategory.title}`);
    });
  }

  function handleClaimTriviaReward() {
    if (!sessionId || !address || !hasTriviaReward || rewardClaimed) {
      return;
    }

    startClaimTransition(async () => {
      setClaimMessage("");

      const response = await claimTriviaReward({
        sessionId,
        walletAddress: address,
        correctAnswers: score,
        totalQuestions: questions.length,
        categoryTitle: selectedCategory.title
      });

      if (!response.ok) {
        setClaimMessage("message" in response ? response.message ?? "Claim request completed." : "Claim request completed.");
        setStatus("message" in response ? response.message ?? "Unable to start trivia session." : "Unable to start trivia session.");
        return;
      }

      setRewardClaimed(true);
      setClaimMessage("message" in response ? response.message ?? "Claim request completed." : "Claim request completed.");
      setStatus("message" in response ? response.message ?? "Unable to start trivia session." : "Unable to start trivia session.");

      window.dispatchEvent(
        new CustomEvent("geni-wallet-credit", {
          detail: {
            amount: response.rewardAmount,
            source: "trivia",
            categoryTitle: selectedCategory.title,
            correctAnswers: score
          }
        })
      );

      window.dispatchEvent(new CustomEvent("geni-open-wallet"));
    });
  }
  useEffect(() => {
    if (!voiceEnabled || !started || finished || submitted || !currentQuestion) {
      return;
    }

    const timer = window.setTimeout(() => {
      readCurrentQuestion();
    }, 450);

    return () => window.clearTimeout(timer);
  }, [voiceEnabled, started, finished, submitted, currentQuestion, questionIndex]);

  useEffect(() => {
    if (!submitted || !currentQuestion) {
      return;
    }

    if (isCorrect) {
      void playCorrectAnswerSound();

      speakTriviaText(
        `Correct answer. ${currentQuestion.answer}. ${currentQuestion.explanation}`
      );

      return;
    }

    void playWrongAnswerSound();

    speakTriviaText(
      `Wrong answer. The correct answer is ${currentQuestion.answer}. ${currentQuestion.explanation}`
    );
  }, [submitted, currentQuestion, isCorrect]);

  useEffect(() => {
    return () => {
      stopTriviaVoice();
    };
  }, []);

  return (
    <section className="space-y-6">
      <audio ref={correctAnswerAudioRef} src={CORRECT_ANSWER_AUDIO_SRC} preload="auto" />
      <audio ref={wrongAnswerAudioRef} src={WRONG_ANSWER_AUDIO_SRC} preload="auto" />

      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          AI Trivia
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">Proof of Knowledge Trivia</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          Select a level, subject, or category. AI generates fresh questions for that topic.
          Each correct answer earns{" "}
          <span className="font-semibold text-white">
            {REWARD_PER_TRIVIA_CORRECT.toFixed(8)} G
          </span>.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setVoiceEnabled((current) => !current)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
          >
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </button>

          {started && !finished && currentQuestion ? (
            <button
              type="button"
              onClick={readCurrentQuestion}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100"
            >
              Read Question
            </button>
          ) : null}
        </div>
      </section>

      {!started && !finished ? (
        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
            Select Subject
          </div>
          <h3 className="mt-2 text-2xl font-bold text-white">
            Choose what the AI should generate trivia about.
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TRIVIA_CATEGORIES.map((category) => {
              const active = category.key === selectedCategoryKey;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedCategoryKey(category.key)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    active
                      ? "border-cyan-300/30 bg-cyan-400/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="text-lg font-semibold text-white">{category.title}</div>
                  <div className="mt-2 text-sm text-white/70">{category.subtitle}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
                    {category.learnerBand}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startTrivia}
            disabled={isPending}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Generating AI Trivia..." : "Start AI Trivia"}
            <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : null}

      {started && !finished && currentQuestion ? (
        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                {selectedCategory.title}
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Question {questionIndex + 1}/{questions.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              Score: <span className="font-semibold text-white">{score}</span>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="text-lg font-semibold text-white">{currentQuestion.prompt}</div>

            <div className="mt-4 grid gap-3">
              {currentQuestion.options.map((option) => {
                const selected = selectedAnswer === option;
                const showCorrect = submitted && option === currentQuestion.answer;
                const showWrong = submitted && selected && option !== currentQuestion.answer;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={submitted}
                    onClick={() => setSelectedAnswer(option)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      showCorrect
                        ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
                        : showWrong
                          ? "border-red-300/40 bg-red-500/20 text-red-100"
                          : selected
                            ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-white/85"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {submitted ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-4 text-sm ${
                  isCorrect
                    ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                    : "border-red-300/30 bg-red-500/10 text-red-100"
                }`}
              >
                <div className="font-semibold">
                  {isCorrect ? "Correct!" : `Wrong. Correct answer: ${currentQuestion.answer}`}
                </div>
                <div className="mt-2 text-white/85">{currentQuestion.explanation}</div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {!submitted ? (
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
                >
                  {isLastQuestion ? "Finish Trivia" : "Next Question"}
                </button>
              )}

              <button
                type="button"
                onClick={resetTrivia}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white"
              >
                Change Subject
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {finished ? (
        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
            Trivia Complete
          </div>
          <h3 className="mt-2 text-3xl font-black text-white">{selectedCategory.title}</h3>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr,1.2fr]">
            <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-500/10 p-5">
              <div className="text-sm text-white/80">Final Score</div>
              <div className="mt-2 text-5xl font-black text-white">
                {score}/{questions.length}
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-400/10 p-5">
              <div className="text-sm text-white/80">Trivia Reward</div>
              <div className="mt-1 text-4xl font-black text-white">{rewardAmount}</div>
              <div className="mt-1 text-sm text-cyan-100">G Coins</div>

              {hasTriviaReward ? (
                <button
                  type="button"
                  onClick={handleClaimTriviaReward}
                  disabled={!isConnected || rewardClaimed || isClaimingReward}
                  className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isClaimingReward
                    ? "Sending G Coins..."
                    : rewardClaimed
                      ? "Reward Sent to Wallet"
                      : "Claim Trivia Reward"}
                </button>
              ) : (
                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                  Score at least one correct answer to unlock a trivia payout.
                </div>
              )}

              {!isConnected ? (
                <div className="mt-3 text-sm text-red-100">
                  Connect your wallet to receive G coins.
                </div>
              ) : null}

              {claimMessage ? (
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                  {claimMessage}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startTrivia}
              disabled={isPending}
              className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              Play Again
            </button>

            <button
              type="button"
              onClick={resetTrivia}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white"
            >
              Choose Another Subject
            </button>
          </div>
        </section>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
        {status}
      </div>
    </section>
  );
}






