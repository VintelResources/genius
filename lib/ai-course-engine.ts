import { getServerAiConfig } from "@/lib/server-env";

export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

export type AiGeneratedCourse = {
  id: string;
  title: string;
  subject: string;
  learnerBand: LearnerBand;
  summary: string;
  outcomes: string[];
  modules: {
    id: string;
    title: string;
    summary: string;
    duration: string;
  }[];
};

type CourseGenerationInput = {
  learnerBand?: LearnerBand | "all";
  subject?: string | "all";
  courseCount?: number;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function sanitizeCourses(input: unknown): AiGeneratedCourse[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const courses: AiGeneratedCourse[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const title = cleanText(record.title);
    const subject = cleanText(record.subject);
    const learnerBand = cleanText(record.learnerBand) as LearnerBand;
    const summary = cleanText(record.summary);
    const outcomes = Array.isArray(record.outcomes)
      ? record.outcomes.map(cleanText).filter(Boolean).slice(0, 5)
      : [];

    const rawModules = Array.isArray(record.modules) ? record.modules : [];
    const modules = rawModules
      .map((module, index) => {
        if (!module || typeof module !== "object") {
          return null;
        }

        const moduleRecord = module as Record<string, unknown>;
        const moduleTitle = cleanText(moduleRecord.title);
        const moduleSummary = cleanText(moduleRecord.summary);
        const moduleDuration = cleanText(moduleRecord.duration) || "8 min";

        if (!moduleTitle || !moduleSummary) {
          return null;
        }

        return {
          id: `${slugify(title)}-module-${index + 1}`,
          title: moduleTitle,
          summary: moduleSummary,
          duration: moduleDuration
        };
      })
      .filter(Boolean)
      .slice(0, 8) as AiGeneratedCourse["modules"];

    if (
      !title ||
      !subject ||
      !summary ||
      !["toddlers", "primary", "secondary", "tertiary"].includes(learnerBand) ||
      modules.length < 4
    ) {
      continue;
    }

    const key = `${title}__${subject}__${learnerBand}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    courses.push({
      id: slugify(`${learnerBand}-${subject}-${title}`),
      title,
      subject,
      learnerBand,
      summary,
      outcomes,
      modules
    });
  }

  return courses;
}

function buildPrompt(input: Required<CourseGenerationInput>) {
  return [
    `Generate a large set of in-house learning courses for Little Genius.`,
    `Return ONLY valid JSON.`,
    `Return exactly ${input.courseCount} courses in a JSON array.`,
    `Each course must include: title, subject, learnerBand, summary, outcomes, modules.`,
    `Each modules array must contain 4 to 8 modules.`,
    `Each module must include: title, summary, duration.`,
    `Keep all courses practical, engaging, and curriculum-relevant.`,
    `Make courses feel different from each other.`,
    `Avoid repetition in titles and module structures.`,
    `Target learner band: ${input.learnerBand}`,
    `Target subject: ${input.subject}`,
    `Support curriculum subjects like English, Science, History, Geography, Physics, Chemistry, Accounts, Economics, Forex and Markets, Engineering, Communication Skills, Politics, and Current Affairs.`,
    `For toddlers: playful, concrete, sensory, simple language.`,
    `For primary: foundational, clear, practical, confidence-building.`,
    `For secondary: analytical, richer subject depth, structured progression.`,
    `For tertiary: advanced, professional, conceptual, career-relevant.`
  ].join("\n");
}

async function generateWithGemini(prompt: string) {
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
    return sanitizeCourses(JSON.parse(extractJsonBlock(text)));
  } catch {
    return [];
  }
}

async function generateWithOpenAi(prompt: string) {
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
            "You generate clean JSON arrays of diverse curriculum courses for an educational app."
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
    return sanitizeCourses(JSON.parse(extractJsonBlock(text)));
  } catch {
    return [];
  }
}

function fallbackCourses(): AiGeneratedCourse[] {
  return [
    {
      id: "toddlers-colors-play",
      title: "Playful Colors and Everyday Objects",
      subject: "Early Learning",
      learnerBand: "toddlers",
      summary: "A joyful course helping toddlers identify colors through familiar objects and playful matching.",
      outcomes: [
        "Recognize common colors",
        "Match colors to objects",
        "Build observation skills"
      ],
      modules: [
        { id: "toddlers-colors-play-module-1", title: "Meet the Rainbow", summary: "Introduce red, blue, yellow, green, and orange through bright visuals.", duration: "7 min" },
        { id: "toddlers-colors-play-module-2", title: "Color Hunt at Home", summary: "Find objects around the house and connect them to colors.", duration: "8 min" },
        { id: "toddlers-colors-play-module-3", title: "Mix and Match", summary: "Match toys, fruits, and clothes to their colors.", duration: "7 min" },
        { id: "toddlers-colors-play-module-4", title: "Color Story Time", summary: "Use short stories to reinforce color words.", duration: "8 min" }
      ]
    },
    {
      id: "primary-reading-confidence",
      title: "Reading Confidence Builder",
      subject: "English",
      learnerBand: "primary",
      summary: "A foundational English course that grows reading confidence through phonics, sentence meaning, and short passages.",
      outcomes: [
        "Read simple words confidently",
        "Understand sentence meaning",
        "Answer short comprehension questions"
      ],
      modules: [
        { id: "primary-reading-confidence-module-1", title: "Letter Sounds and Blends", summary: "Practice common letter sounds and sound blends.", duration: "8 min" },
        { id: "primary-reading-confidence-module-2", title: "Words Around Us", summary: "Read everyday words from school, home, and play.", duration: "8 min" },
        { id: "primary-reading-confidence-module-3", title: "Sentence Sense", summary: "Build meaning from short simple sentences.", duration: "9 min" },
        { id: "primary-reading-confidence-module-4", title: "Story Time Questions", summary: "Read short stories and answer understanding questions.", duration: "10 min" },
        { id: "primary-reading-confidence-module-5", title: "Vocabulary Builder", summary: "Grow simple but useful vocabulary through context.", duration: "8 min" }
      ]
    },
    {
      id: "secondary-world-history",
      title: "World History and Civilizations",
      subject: "History",
      learnerBand: "secondary",
      summary: "A rich secondary course exploring major civilizations, leadership, trade, conflict, and global change.",
      outcomes: [
        "Explain major civilizations",
        "Trace historical cause and effect",
        "Connect past events to modern societies"
      ],
      modules: [
        { id: "secondary-world-history-module-1", title: "Ancient Civilizations", summary: "Explore Egypt, Mesopotamia, and early organized societies.", duration: "10 min" },
        { id: "secondary-world-history-module-2", title: "Empires and Expansion", summary: "Understand how empires grew and governed.", duration: "10 min" },
        { id: "secondary-world-history-module-3", title: "Trade, Culture, and Exchange", summary: "Study how ideas and goods moved across regions.", duration: "9 min" },
        { id: "secondary-world-history-module-4", title: "Revolutions that Changed the World", summary: "Examine political and industrial revolutions.", duration: "11 min" },
        { id: "secondary-world-history-module-5", title: "Modern Global Turning Points", summary: "Analyze major twentieth-century shifts.", duration: "10 min" }
      ]
    },
    {
      id: "secondary-physics-motion",
      title: "Motion, Forces, and Energy",
      subject: "Physics",
      learnerBand: "secondary",
      summary: "A strong physics course introducing motion, speed, force, work, and energy using real-world examples.",
      outcomes: [
        "Describe motion clearly",
        "Solve basic force questions",
        "Relate physics to daily life"
      ],
      modules: [
        { id: "secondary-physics-motion-module-1", title: "Describing Motion", summary: "Learn distance, displacement, speed, and velocity.", duration: "10 min" },
        { id: "secondary-physics-motion-module-2", title: "Forces All Around Us", summary: "Explore pushes, pulls, gravity, and friction.", duration: "9 min" },
        { id: "secondary-physics-motion-module-3", title: "Newton's Laws in Action", summary: "Apply the laws of motion to everyday events.", duration: "11 min" },
        { id: "secondary-physics-motion-module-4", title: "Work and Energy", summary: "Connect work, power, and forms of energy.", duration: "10 min" },
        { id: "secondary-physics-motion-module-5", title: "Machines and Efficiency", summary: "See how physics supports practical systems.", duration: "9 min" }
      ]
    },
    {
      id: "tertiary-software-systems",
      title: "Software Systems and Engineering Practice",
      subject: "Engineering",
      learnerBand: "tertiary",
      summary: "A tertiary-level course focused on software design, system thinking, debugging, testing, and engineering workflows.",
      outcomes: [
        "Design modular systems",
        "Reason about software trade-offs",
        "Apply testing and debugging practices"
      ],
      modules: [
        { id: "tertiary-software-systems-module-1", title: "Systems Thinking for Engineers", summary: "Understand components, dependencies, and architecture.", duration: "12 min" },
        { id: "tertiary-software-systems-module-2", title: "Designing Maintainable Software", summary: "Learn modularity, abstractions, and clean interfaces.", duration: "12 min" },
        { id: "tertiary-software-systems-module-3", title: "Testing and Reliability", summary: "Explore test strategies and quality practices.", duration: "11 min" },
        { id: "tertiary-software-systems-module-4", title: "Debugging Complex Failures", summary: "Use structured methods to isolate problems.", duration: "12 min" },
        { id: "tertiary-software-systems-module-5", title: "Delivery and Engineering Collaboration", summary: "Connect engineering with product delivery and teamwork.", duration: "10 min" }
      ]
    },
    {
      id: "tertiary-markets-economics",
      title: "Markets, Forex, and Applied Economics",
      subject: "Forex and Markets",
      learnerBand: "tertiary",
      summary: "A practical course linking macroeconomics, currency movement, market structure, and trading awareness.",
      outcomes: [
        "Explain core market drivers",
        "Interpret currency movement",
        "Understand risk and decision-making"
      ],
      modules: [
        { id: "tertiary-markets-economics-module-1", title: "How Markets Move", summary: "Understand price discovery, buyers, sellers, and sentiment.", duration: "11 min" },
        { id: "tertiary-markets-economics-module-2", title: "Foundations of Forex", summary: "Learn currency pairs, quotes, and exchange dynamics.", duration: "10 min" },
        { id: "tertiary-markets-economics-module-3", title: "Economics Behind Price", summary: "Connect inflation, rates, and policy to markets.", duration: "12 min" },
        { id: "tertiary-markets-economics-module-4", title: "Risk and Position Thinking", summary: "Develop disciplined market reasoning.", duration: "10 min" },
        { id: "tertiary-markets-economics-module-5", title: "Reading Market Context", summary: "Interpret market scenarios without guesswork.", duration: "11 min" }
      ]
    }
  ];
}

export async function generateAiCourses(
  input: CourseGenerationInput = {}
): Promise<AiGeneratedCourse[]> {
  const learnerBand = input.learnerBand ?? "all";
  const subject = input.subject ?? "all";
  const courseCount = input.courseCount ?? 16;
  const prompt = buildPrompt({
    learnerBand,
    subject,
    courseCount
  });

  const geminiCourses = await generateWithGemini(prompt);
  if (geminiCourses.length >= Math.min(8, courseCount)) {
    return geminiCourses.slice(0, courseCount);
  }

  const openAiCourses = await generateWithOpenAi(prompt);
  if (openAiCourses.length >= Math.min(8, courseCount)) {
    return openAiCourses.slice(0, courseCount);
  }

  return fallbackCourses();
}

