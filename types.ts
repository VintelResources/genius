export const UserLevel = {
  KINDERGARTEN: "KINDERGARTEN",
  TODDLERS: "toddlers",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
  UNIVERSITY: "UNIVERSITY",
  LIFELONG: "LIFELONG"
} as const;

export type UserLevel =
  | (typeof UserLevel)[keyof typeof UserLevel]
  | "toddlers"
  | "primary"
  | "secondary"
  | "tertiary"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "UNIVERSITY"
  | "LIFELONG"
  | number;

export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert";

export const QuestionType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  SHORT_ANSWER: "SHORT_ANSWER",
  FILL_IN_BLANKS: "FILL_IN_BLANKS",
  VOICE: "VOICE"
} as const;

export type QuestionType =
  | (typeof QuestionType)[keyof typeof QuestionType]
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "voice";

export const Subject = {
  CRYPTO: "CRYPTO",
  FOREX: "FOREX",
  STOCKS: "STOCKS",
  MATH: "MATH",
  SCIENCE: "SCIENCE",
  ENGLISH: "ENGLISH",
  HISTORY: "HISTORY",
  GEOGRAPHY: "GEOGRAPHY",
  PHYSICS: "PHYSICS",
  CHEMISTRY: "CHEMISTRY",
  GLOBAL_EXPLORER: "GLOBAL_EXPLORER",

  TODDLER_MATH_GAMES: "TODDLER_MATH_GAMES",
  TODDLER_SCIENCE_FUN: "TODDLER_SCIENCE_FUN",
  TODDLER_ENGLISH_BASICS: "TODDLER_ENGLISH_BASICS",
  TODDLER_FUNDAMENTALS: "TODDLER_FUNDAMENTALS",
  PHONICS_ADVENTURE: "PHONICS_ADVENTURE",
  NUMBER_GAMES: "NUMBER_GAMES",
  EMOTIONAL_IQ: "EMOTIONAL_IQ",
  NATURE_DISCOVERY: "NATURE_DISCOVERY",
  ALPHABET_STORY: "ALPHABET_STORY",
  COLOR_MASTER: "COLOR_MASTER",

  CREATIVE_WRITING: "CREATIVE_WRITING",
  MATH_QUEST: "MATH_QUEST",
  EARTH_SCIENCE: "EARTH_SCIENCE",
  INTRO_CODING: "INTRO_CODING",
  ANCIENT_EGYPT: "ANCIENT_EGYPT",
  SPACE_PIONEERS: "SPACE_PIONEERS",

  ADVANCED_ALGEBRA: "ADVANCED_ALGEBRA",
  CLASSICAL_PHYSICS: "CLASSICAL_PHYSICS",
  GLOBAL_HISTORY: "GLOBAL_HISTORY",
  FINANCIAL_LITERACY: "FINANCIAL_LITERACY",
  PYTHON_PRO: "PYTHON_PRO",
  BIO_GENETICS: "BIO_GENETICS",
  MODERN_LIT: "MODERN_LIT",

  NEURAL_NETWORKS: "NEURAL_NETWORKS",
  MACRO_ECONOMICS: "MACRO_ECONOMICS",
  MOLECULAR_BIO: "MOLECULAR_BIO",
  QUANTUM_PHYSICS: "QUANTUM_PHYSICS",
  COGNITIVE_PSYCH: "COGNITIVE_PSYCH",
  CYBER_SECURITY: "CYBER_SECURITY",
  SUSTAINABLE_ENG: "SUSTAINABLE_ENG",

  SCIENCE_WELLBEING: "SCIENCE_WELLBEING",
  DIGITAL_MARKETING: "DIGITAL_MARKETING",
  LEADERSHIP_SKILLS: "LEADERSHIP_SKILLS",
  MINDFULNESS_MEDITATION: "MINDFULNESS_MEDITATION",
  DATA_VISUALIZATION: "DATA_VISUALIZATION",
  PUBLIC_SPEAKING: "PUBLIC_SPEAKING",
  PHOTOGRAPHY_PRO: "PHOTOGRAPHY_PRO",

  QUANTUM_COMPUTING: "QUANTUM_COMPUTING",
  GENOMIC_MEDICINE: "GENOMIC_MEDICINE",
  ASTROPHYSICS: "ASTROPHYSICS",
  AI_ETHICS: "AI_ETHICS",

  HARVARD_CS50: "HARVARD_CS50",
  MIT_ALGORITHMS: "MIT_ALGORITHMS",
  COURSERA_ML: "COURSERA_ML",
  UDEMY_WEB_DEV: "UDEMY_WEB_DEV",
  YALE_PSYCHOLOGY: "YALE_PSYCHOLOGY",
  STANFORD_AI: "STANFORD_AI",
  GOOGLE_DATA_ANALYTICS: "GOOGLE_DATA_ANALYTICS",
  IBM_DATA_SCIENCE: "IBM_DATA_SCIENCE",
  FREECODECAMP_JS: "FREECODECAMP_JS",
  EDX_FINANCE: "EDX_FINANCE"
} as const;

export type Subject = (typeof Subject)[keyof typeof Subject] | string;

export type SubjectInfo = {
  id?: string;
  key?: string;
  name?: string;
  title?: string;
  description?: string;
  level?: UserLevel | string | number;
  category?: string;
  icon?: string;
  color?: string;
};

export type QuizQuestion = {
  id?: string;
  question: string;
  prompt?: string;
  options?: string[];
  answer?: string;
  correctAnswer?: string;
  correctIndex?: number;
  explanation?: string;
  difficulty?: Difficulty;
  type: QuestionType;
  subject?: string;
  category?: string;
};

export type ExamResult = {
  id?: string;
  userId?: string;
  subject?: string;
  category?: string;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  passed?: boolean;
  createdAt?: string | Date;
};

export type Transaction = {
  id: string;
  type?: string;
  amount: number;
  description?: string;
  createdAt?: string | Date;
  timestamp: string | Date;
  status?: string;
  hash?: string;
  targetAsset?: string;
  targetAmount?: number;
  asset?: string;
  fromAsset?: string;
  toAsset?: string;
  value?: number;
  label?: string;
};

export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  walletAddress?: string;
  address?: string;
  displayName?: string;
  learnerBand?: string;
  isWalletLinked?: boolean;

  avatar?: string;
  avatarUrl?: string;

  level?: UserLevel | string | number;
  experience?: number;
  score?: number;
  points?: number;
  coins?: number;
  geniusCoins?: number;
  geniusTokens: number;

  streak?: number;
  bestStreak?: number;
  rank?: number | string;
  badges?: string[];
  achievements?: string[];

  completedLessons?: number;
  completedQuizzes?: number;
  transactions?: Transaction[];
  btcBalance: number;
  ethBalance: number;
  solBalance: number;
  usdcBalance: number;
  customPaths?: LearningPath[];
  learningPathProgress?: {
    pathId: string;
    completedSteps?: string[];
    progress?: number;
  }[];
  referralCode?: string;
  referralCount?: number;
  referredBy?: string;
};

export type LearningPath = {
  id?: string;
  key?: string;
  title?: string;
  name?: string;
  description?: string;
  level?: UserLevel | string | number;
  subject?: Subject | string;
  difficulty?: string;
  modules?: any[];
  lessons?: any[];
  steps?: PathStep[];
  progress?: number;
  totalReward?: number;
  estimatedTime?: string | number;
  duration?: string | number;
  prerequisites?: string[];
  rewards?: any;
  xp?: number;
  objectives?: string[];
};

export type PathStep = {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  locked?: boolean;
  subject?: Subject | string;
};

export type LearningPaths = LearningPath;

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant" | "system" | "model";
  content?: string;
  text?: string;
  timestamp: string | Date;
  createdAt?: string | Date;
};

export type FoundationTreasury = {
  balance?: number;
  totalSupply?: number;
  distributed?: number;
  reserved?: number;

  learnerRewards?: number;
  foundation?: number;
  liquidity?: number;
  ecosystem?: number;
  team?: number;
  treasury?: number;

  operationalWallet: number;
  totalWithdrawn: number;

  educationVault?: number;
  developmentVault?: number;
  marketingVault?: number;
  charityVault?: number;
  reserveVault?: number;

  [key: string]: number | undefined;
};

export const TOKEN_CONSTANTS = {
  SYMBOL: "G",
  NAME: "Genius Coin",
  MAX_SUPPLY: 21000000,
  DECIMALS: 18,
  HALVING_INTERVAL: 2625000,
  DAILY_CAP: 100000,

  REWARD_PER_CORRECT: 0.00000001,

  INITIAL_REWARDS: {
    QUIZ_CORRECT: 0.00000001,
    ASSESSMENT_PASS: 0.0000001,
    MODULE_MASTERED: 0.000001
  },

  EXCHANGE_RATES: {
    USDC: 0.01,
    USDT: 0.01,
    BNB: 0.00001,
    ETH: 0.000003,
    BTC: 0.0000001
  },

  DISTRIBUTION: {
    LEARNERS: 0.5,
    ECOSYSTEM: 0.2,
    PARTNERSHIPS: 0.1,
    TEAM: 0.05,
    LIQUIDITY: 0.15,
    FOUNDATION: 0.2
  }
} as const;



























