export type TriviaCategory = {
  key: string;
  title: string;
  subtitle: string;
  learnerBand: "toddlers" | "primary" | "secondary" | "tertiary";
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
  }
];

export function getTriviaCategories() {
  return TRIVIA_CATEGORIES;
}

export function getTriviaCategoryGroups() {
  return [
    {
      title: "All Categories",
      categories: TRIVIA_CATEGORIES
    }
  ];
}

