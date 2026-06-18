export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

export type TriviaTopic = {
  id: string;
  title: string;
  description: string;
};

export type TriviaSubject = {
  id: string;
  title: string;
  description: string;
  band: LearnerBand;
  topics: TriviaTopic[];
};

export const TRIVIA_SUBJECTS: TriviaSubject[] = [
  {
    id: "early-learning",
    title: "Early Learning",
    description: "Foundational early learning topics.",
    band: "toddlers",
    topics: [
      { id: "colors", title: "Colors", description: "Colors, matching, and recognition." },
      { id: "shapes", title: "Shapes", description: "Shapes, patterns, and playful logic." },
      { id: "animals", title: "Animals", description: "Common animals and simple facts." }
    ]
  },
  {
    id: "english-primary",
    title: "English",
    description: "Reading, grammar, and vocabulary.",
    band: "primary",
    topics: [
      { id: "reading", title: "Reading", description: "Comprehension and meaning." },
      { id: "grammar", title: "Grammar", description: "Sentence basics and usage." },
      { id: "vocabulary", title: "Vocabulary", description: "Words and expressions." }
    ]
  },
  {
    id: "science-primary",
    title: "Science",
    description: "Nature and basic science ideas.",
    band: "primary",
    topics: [
      { id: "plants-animals", title: "Plants & Animals", description: "Living things and habitats." },
      { id: "weather", title: "Weather", description: "Rain, wind, and seasons." },
      { id: "simple-science", title: "Simple Science", description: "Light, force, and matter." }
    ]
  },
  {
    id: "history-primary",
    title: "History",
    description: "Important people and past events.",
    band: "primary",
    topics: [
      { id: "heroes", title: "Heroes", description: "Important people from history." },
      { id: "events", title: "Events", description: "Famous moments from the past." },
      { id: "culture", title: "Culture", description: "Traditions and heritage." }
    ]
  },
  {
    id: "geography-primary",
    title: "Geography",
    description: "Places, maps, and landforms.",
    band: "primary",
    topics: [
      { id: "maps", title: "Maps", description: "Directions and map basics." },
      { id: "countries", title: "Countries", description: "Countries and capitals." },
      { id: "landforms", title: "Landforms", description: "Mountains, rivers, and valleys." }
    ]
  },
  {
    id: "physics-secondary",
    title: "Physics",
    description: "Energy, force, motion, and waves.",
    band: "secondary",
    topics: [
      { id: "motion", title: "Motion", description: "Speed, velocity, and movement." },
      { id: "energy", title: "Energy", description: "Work, power, and energy." },
      { id: "electricity", title: "Electricity", description: "Current, circuits, and charge." }
    ]
  },
  {
    id: "chemistry-secondary",
    title: "Chemistry",
    description: "Matter, reactions, and elements.",
    band: "secondary",
    topics: [
      { id: "elements", title: "Elements", description: "Atoms, symbols, and periodic trends." },
      { id: "reactions", title: "Reactions", description: "Chemical changes and equations." },
      { id: "acids-bases", title: "Acids & Bases", description: "pH and common reactions." }
    ]
  },
  {
    id: "accounts-tertiary",
    title: "Accounts",
    description: "Bookkeeping and accounting basics.",
    band: "tertiary",
    topics: [
      { id: "ledgers", title: "Ledgers", description: "Recording and classifying transactions." },
      { id: "journals", title: "Journals", description: "Journal entries and posting." },
      { id: "statements", title: "Statements", description: "Financial statements and balance sheets." }
    ]
  },
  {
    id: "economics-tertiary",
    title: "Economics",
    description: "Markets, incentives, and policy.",
    band: "tertiary",
    topics: [
      { id: "micro", title: "Microeconomics", description: "Demand, supply, and firm behavior." },
      { id: "macro", title: "Macroeconomics", description: "Inflation, GDP, and policy." },
      { id: "trade", title: "Trade", description: "Global trade and exchange." }
    ]
  },
  {
    id: "forex-markets-tertiary",
    title: "Forex and Markets",
    description: "Currencies, trading, and market ideas.",
    band: "tertiary",
    topics: [
      { id: "forex", title: "Forex", description: "Currency pairs and exchange rates." },
      { id: "market-basics", title: "Market Basics", description: "How markets work." },
      { id: "risk", title: "Risk", description: "Risk, volatility, and discipline." }
    ]
  },
  {
    id: "engineering-tertiary",
    title: "Engineering",
    description: "Applied science and problem solving.",
    band: "tertiary",
    topics: [
      { id: "mechanics", title: "Mechanics", description: "Forces, systems, and design." },
      { id: "systems", title: "Systems", description: "Structures and technical systems." },
      { id: "innovation", title: "Innovation", description: "Design thinking and solutions." }
    ]
  },
  {
    id: "communication-tertiary",
    title: "Communication Skills",
    description: "Expression, writing, and presentation.",
    band: "tertiary",
    topics: [
      { id: "writing", title: "Writing", description: "Clear and effective written communication." },
      { id: "speaking", title: "Speaking", description: "Presentation and public speaking." },
      { id: "professional", title: "Professional Communication", description: "Workplace communication skills." }
    ]
  },
  {
    id: "politics-tertiary",
    title: "Politics",
    description: "Government, power, and leadership.",
    band: "tertiary",
    topics: [
      { id: "government", title: "Government", description: "Structures and systems of governance." },
      { id: "citizenship", title: "Citizenship", description: "Rights, duties, and participation." },
      { id: "policy", title: "Policy", description: "Decision-making and public policy." }
    ]
  },
  {
    id: "current-affairs-tertiary",
    title: "Current Affairs",
    description: "Recent events and public issues.",
    band: "tertiary",
    topics: [
      { id: "regional", title: "Regional Issues", description: "Current issues in the region." },
      { id: "global", title: "Global Issues", description: "Major world events and debates." },
      { id: "media", title: "Media Literacy", description: "Understanding and evaluating news." }
    ]
  }
];

export function getTriviaSubjects(level?: LearnerBand | "all"): TriviaSubject[] {
  if (!level || level === "all") {
    return TRIVIA_SUBJECTS;
  }

  return TRIVIA_SUBJECTS.filter((subject) => subject.band === level);
}

