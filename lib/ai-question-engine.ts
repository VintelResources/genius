import { getServerAiConfig } from "@/lib/server-env";

export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";
export type AiQuestionMode = "trivia" | "lesson" | "exam" | "path";

export type AiGeneratedQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
};

type GenerationInput = {
  learnerBand: LearnerBand;
  subject: string;
  topic: string;
  mode: AiQuestionMode;
  count?: number;
  context?: string;
  fallbackQuestions?: AiGeneratedQuestion[];
  avoidPrompts?: string[];
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function extractJsonBlock(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1];
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1);
  }

  return text;
}

function sanitizeQuestions(input: unknown, count: number): AiGeneratedQuestion[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const questions: AiGeneratedQuestion[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const prompt = cleanText(record.prompt);
    const correctAnswer = cleanText(record.correctAnswer);
    const explanation =
      cleanText(record.explanation) ||
      `Tutor: "${correctAnswer}" is correct because it best fits the topic being tested.`;

    const rawOptions = Array.isArray(record.options) ? record.options : [];
    const options = rawOptions.map(cleanText).filter(Boolean).slice(0, 4);

    if (!prompt || !correctAnswer || options.length !== 4) {
      continue;
    }

    if (!options.includes(correctAnswer)) {
      continue;
    }

    const key = `${prompt}__${correctAnswer}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    questions.push({
      prompt,
      options: [options[0], options[1], options[2], options[3]],
      correctAnswer,
      explanation
    });

    if (questions.length >= count) {
      break;
    }
  }

  return questions;
}

function normalizePrompt(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeAgainstAvoidPrompts(
  questions: AiGeneratedQuestion[],
  avoidPrompts: string[]
) {
  const config = getServerAiConfig();

  if (!config.enableUniquenessFilter || !avoidPrompts.length) {
    return questions;
  }

  const blocked = new Set(avoidPrompts.map(normalizePrompt));
  return questions.filter((question) => !blocked.has(normalizePrompt(question.prompt)));
}

function buildPrompt(input: GenerationInput) {
  const config = getServerAiConfig();
  const questionCount = input.count ?? config.questionCount;
  const avoidSection =
    input.avoidPrompts && input.avoidPrompts.length > 0
      ? [
          `Do NOT reuse or closely paraphrase these recent question prompts:`,
          ...input.avoidPrompts.slice(0, 40).map((item, index) => `${index + 1}. ${item}`)
        ].join("\n")
      : "";

  const adaptationSection = [
    config.enableLevelAdaptation
      ? `Adjust wording and difficulty to the learner level.`
      : "",
    config.enablePerformanceAdaptation
      ? `Prefer conceptual breadth and fresh coverage over repeating earlier facts.`
      : "",
    config.enableTopicRotation
      ? `Rotate subtopics within the subject so this session feels new and diverse.`
      : ""
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `You are generating creative, diverse, curriculum-appropriate multiple choice questions for learners.`,
    `Return ONLY valid JSON.`,
    `Return exactly ${questionCount} questions in a JSON array.`,
    `Each item must have: prompt, options, correctAnswer, explanation.`,
    `options must contain exactly 4 short answer options.`,
    `correctAnswer must match exactly one option.`,
    `Every question must be meaningfully different from the others.`,
    `Avoid repetitive wording, repeated facts, repeated templates, and repeated answer patterns.`,
    `Questions must fit the learner level and be age-appropriate.`,
    `Make the distractors plausible but clearly wrong.`,
    `Use varied, creative wording and avoid duplicates.`,
    `Learner level: ${input.learnerBand}`,
    `Mode: ${input.mode}`,
    `Subject: ${input.subject}`,
    `Topic: ${input.topic}`,
    input.context ? `Context: ${input.context}` : "",
    `For toddlers: very simple words, concrete objects, playful style.`,
    `For primary: short sentences, practical examples, clear vocabulary.`,
    `For secondary: richer reasoning, subject detail, moderate challenge.`,
    `For tertiary: deeper conceptual reasoning, academic framing, precise terminology.`,
    `Explanations should be short and helpful for a tutor review panel.`,
    adaptationSection,
    avoidSection
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateWithGemini(prompt: string, count: number) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const config = getServerAiConfig();

  if (!apiKey) {
    return [];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: config.temperature
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? "")
      .join("\n") ?? "";

  if (!text) {
    return [];
  }

  try {
    return sanitizeQuestions(JSON.parse(extractJsonBlock(text)), count);
  } catch {
    return [];
  }
}

async function generateWithOpenAi(prompt: string, count: number) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const config = getServerAiConfig();

  if (!apiKey) {
    return [];
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      temperature: config.temperature,
      messages: [
        {
          role: "system",
          content:
            "You generate clean JSON arrays of age-appropriate, highly varied multiple choice questions."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? "";

  if (!text) {
    return [];
  }

  try {
    return sanitizeQuestions(JSON.parse(extractJsonBlock(text)), count);
  } catch {
    return [];
  }
}

function defaultFallback(input: GenerationInput): AiGeneratedQuestion[] {
  const topic = input.topic;
  const subject = input.subject;
  const learnerBand = input.learnerBand;
  const simple = learnerBand === "toddlers" || learnerBand === "primary";

  return [
    {
      prompt: `Which option best matches the topic "${topic}" in ${subject}?`,
      options: simple
        ? ["The correct lesson idea", "A random animal", "A wrong color", "An unrelated tool"]
        : ["The correct lesson idea", "An unrelated claim", "A false explanation", "A distractor choice"],
      correctAnswer: "The correct lesson idea",
      explanation: `Tutor: "The correct lesson idea" is right because it matches the topic "${topic}".`
    },
    {
      prompt: `What is most important to remember in ${subject}?`,
      options: simple
        ? ["The main concept", "A silly mistake", "A wrong guess", "A made-up answer"]
        : ["The main concept", "A weak distraction", "An incorrect interpretation", "An irrelevant detail"],
      correctAnswer: "The main concept",
      explanation: `Tutor: "The main concept" is correct because strong learning starts with the core idea.`
    },
    {
      prompt: `Which answer best shows understanding of "${topic}"?`,
      options: simple
        ? ["The right idea", "A wrong shape", "A wrong number", "A random object"]
        : ["The right idea", "A wrong premise", "A false conclusion", "A misleading detail"],
      correctAnswer: "The right idea",
      explanation: `Tutor: "The right idea" shows the strongest understanding of the topic.`
    },
    {
      prompt: `Which choice belongs in this ${subject} lesson?`,
      options: simple
        ? ["The lesson answer", "A toy", "A cloud", "A banana"]
        : ["The lesson answer", "An unrelated statement", "A faulty summary", "An off-topic option"],
      correctAnswer: "The lesson answer",
      explanation: `Tutor: "The lesson answer" fits the lesson focus best.`
    },
    {
      prompt: `What should a learner identify first in "${topic}"?`,
      options: simple
        ? ["The key point", "A wrong clue", "A funny guess", "A mixed-up choice"]
        : ["The key point", "A misleading clue", "A false assumption", "A tangential point"],
      correctAnswer: "The key point",
      explanation: `Tutor: "The key point" is correct because it anchors the topic clearly.`
    },
    {
      prompt: `Which answer is the strongest match for ${subject}?`,
      options: simple
        ? ["The correct match", "A random fruit", "A wrong object", "A made-up guess"]
        : ["The correct match", "A weak mismatch", "A false parallel", "A distraction"],
      correctAnswer: "The correct match",
      explanation: `Tutor: "The correct match" aligns best with the subject matter.`
    },
    {
      prompt: `Which option best supports success in this ${input.mode} activity?`,
      options: simple
        ? ["Understanding the topic", "Picking anything", "Skipping the idea", "Guessing wildly"]
        : ["Understanding the topic", "Choosing carelessly", "Ignoring the concept", "Guessing without reasoning"],
      correctAnswer: "Understanding the topic",
      explanation: `Tutor: "Understanding the topic" is right because strong performance depends on comprehension.`
    },
    {
      prompt: `What makes an answer correct in "${topic}"?`,
      options: simple
        ? ["It fits the lesson", "It sounds funny", "It looks random", "It is unrelated"]
        : ["It fits the lesson", "It sounds confident", "It is vaguely related", "It distracts from the topic"],
      correctAnswer: "It fits the lesson",
      explanation: `Tutor: "It fits the lesson" is correct because accuracy depends on alignment with the topic.`
    },
    {
      prompt: `Which idea should a learner avoid in this ${subject} question?`,
      options: simple
        ? ["A wrong answer", "The correct one", "The best idea", "The true lesson point"]
        : ["A wrong answer", "The correct concept", "The strongest reasoning", "The supported choice"],
      correctAnswer: "A wrong answer",
      explanation: `Tutor: "A wrong answer" is correct because learners should avoid inaccurate choices.`
    },
    {
      prompt: `Which option is most likely correct for "${topic}"?`,
      options: simple
        ? ["The best lesson answer", "A random guess", "A silly answer", "An unrelated choice"]
        : ["The best lesson answer", "A random guess", "A misleading statement", "An off-topic option"],
      correctAnswer: "The best lesson answer",
      explanation: `Tutor: "The best lesson answer" is correct because it most directly matches the topic.`
    }
  ];
}

export async function generateAiQuestions(input: GenerationInput): Promise<AiGeneratedQuestion[]> {
  const config = getServerAiConfig();
  const count = input.count ?? config.questionCount;
  const prompt = buildPrompt({ ...input, count });
  const avoidPrompts = input.avoidPrompts ?? [];

  for (let attempt = 0; attempt < config.maxRetries; attempt += 1) {
    const gemini = dedupeAgainstAvoidPrompts(
      await generateWithGemini(prompt, count),
      avoidPrompts
    );
    if (gemini.length === count) {
      return gemini;
    }

    const openai = dedupeAgainstAvoidPrompts(
      await generateWithOpenAi(prompt, count),
      avoidPrompts
    );
    if (openai.length === count) {
      return openai;
    }
  }

  const fallback = dedupeAgainstAvoidPrompts(
    sanitizeQuestions(input.fallbackQuestions ?? defaultFallback(input), count),
    avoidPrompts
  );

  if (fallback.length >= count) {
    return fallback.slice(0, count);
  }

  return sanitizeQuestions(defaultFallback(input), count).slice(0, count);
}

