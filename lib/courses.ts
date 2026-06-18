export type CourseTopic = "spelling" | "science" | "math" | "geography";

export type Lesson = {
  id: string;
  title: string;
  content: string;
};

export type Question = {
  prompt: string;
  answer: string;
  hint: string;
};

export type Course = {
  id: string;
  topic: CourseTopic;
  title: string;
  description: string;
  lessons: Lesson[];
  fallbackQuestions: Question[];
};

export const REWARD_PER_CORRECT = 0.00000001;

export const COURSES: Course[] = [
  {
    id: "spelling-foundations",
    topic: "spelling",
    title: "Spelling Foundations",
    description: "Learn common classroom spelling patterns and word recognition.",
    lessons: [
      {
        id: "spell-1",
        title: "Short Vowels",
        content: "Short vowel sounds appear in simple words like cat, bed, pig, pot, and sun."
      },
      {
        id: "spell-2",
        title: "Consonant Blends",
        content: "Blends combine consonants while keeping each sound, like bl, st, and cr."
      },
      {
        id: "spell-3",
        title: "Silent Letters",
        content: "Some words include silent letters, such as k in knife or b in lamb."
      }
    ],
    fallbackQuestions: [
      { prompt: "Unscramble: tac", answer: "cat", hint: "A small pet that says meow." },
      { prompt: "Unscramble: nus", answer: "sun", hint: "It shines during the day." },
      { prompt: "Unscramble: koob", answer: "book", hint: "You read this." },
      { prompt: "Unscramble: hsfi", answer: "fish", hint: "It swims in water." },
      { prompt: "Unscramble: rtbee", answer: "tree", hint: "It has leaves and grows tall." },
      { prompt: "Unscramble: dargne", answer: "garden", hint: "Flowers and vegetables grow here." },
      { prompt: "Unscramble: wodniw", answer: "window", hint: "You look through it." },
      { prompt: "Unscramble: tekblan", answer: "blanket", hint: "It keeps you warm in bed." },
      { prompt: "Unscramble: rednsuht", answer: "thunder", hint: "A loud sound in a storm." },
      { prompt: "Unscramble: yrrabil", answer: "library", hint: "A place with many books." },
      { prompt: "Unscramble: egualgna", answer: "language", hint: "A system of communication." },
      { prompt: "Unscramble: yjrueno", answer: "journey", hint: "Travel from one place to another." }
    ]
  },
  {
    id: "science-basics",
    topic: "science",
    title: "Science Basics",
    description: "Build simple science understanding before taking your exam.",
    lessons: [
      {
        id: "science-1",
        title: "Living Things",
        content: "Living things grow, use energy, respond to their environment, and reproduce."
      },
      {
        id: "science-2",
        title: "States of Matter",
        content: "Matter can exist as solid, liquid, or gas depending on particle movement."
      },
      {
        id: "science-3",
        title: "The Solar System",
        content: "Planets orbit the Sun, and Earth is the third planet from it."
      }
    ],
    fallbackQuestions: [
      { prompt: "Which state of matter has a fixed shape?", answer: "solid", hint: "Ice is one example." },
      { prompt: "Which star is at the center of our solar system?", answer: "sun", hint: "Earth orbits it." },
      { prompt: "What do plants need to make food?", answer: "sunlight", hint: "It comes from the sun." },
      { prompt: "What gas do humans need to breathe?", answer: "oxygen", hint: "It helps your body make energy." },
      { prompt: "Which planet do we live on?", answer: "earth", hint: "It is the third planet from the sun." },
      { prompt: "Water as steam is a...", answer: "gas", hint: "It spreads to fill a space." },
      { prompt: "A frog begins life as a...", answer: "tadpole", hint: "It swims before growing legs." },
      { prompt: "Animals that eat only plants are called...", answer: "herbivores", hint: "Cows are examples." },
      { prompt: "The process plants use to make food is...", answer: "photosynthesis", hint: "It uses sunlight." },
      { prompt: "The force that pulls objects downward is...", answer: "gravity", hint: "It keeps your feet on the ground." },
      { prompt: "What part of the plant takes in water from soil?", answer: "roots", hint: "They grow underground." },
      { prompt: "A habitat is a living thing's...", answer: "home", hint: "It is where it lives." }
    ]
  }
];

export function getCourseById(courseId: string) {
  return COURSES.find((course) => course.id === courseId) ?? null;
}

