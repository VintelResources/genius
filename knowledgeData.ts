
import { Difficulty } from './types';

export interface GKIEntry {
  rank: number;
  country: string;
  value: number;
  preUni: number;
  tvet: number;
  higherEd: number;
  rdi: number;
  ict: number;
  economy: number;
  env: number;
}

export const GKI_2020_DATA: GKIEntry[] = [
  { rank: 1, country: "Switzerland", value: 73.6, preUni: 76.2, tvet: 77.5, higherEd: 68.6, rdi: 65.7, ict: 82.7, economy: 62.3, env: 86.6 },
  { rank: 2, country: "United States", value: 71.1, preUni: 63.2, tvet: 92.3, higherEd: 57.8, rdi: 64.3, ict: 86.5, economy: 61.1, env: 73.5 },
  { rank: 3, country: "Finland", value: 70.8, preUni: 78.5, tvet: 81.0, higherEd: 56.1, rdi: 57.0, ict: 81.9, economy: 61.6, env: 83.8 },
  { rank: 4, country: "Sweden", value: 70.6, preUni: 76.4, tvet: 69.7, higherEd: 57.9, rdi: 65.5, ict: 84.6, economy: 59.9, env: 85.4 },
  { rank: 5, country: "Netherlands", value: 69.7, preUni: 71.2, tvet: 76.8, higherEd: 56.2, rdi: 58.4, ict: 84.5, economy: 63.5, env: 80.9 },
  { rank: 6, country: "Luxembourg", value: 69.5, preUni: 70.7, tvet: 72.2, higherEd: 66.2, rdi: 47.6, ict: 85.3, economy: 65.4, env: 84.0 },
  { rank: 7, country: "Singapore", value: 69.2, preUni: 75.2, tvet: 60.2, higherEd: 56.0, rdi: 53.3, ict: 85.9, economy: 76.6, env: 81.3 },
  { rank: 8, country: "Denmark", value: 68.3, preUni: 75.4, tvet: 63.6, higherEd: 61.0, rdi: 57.8, ict: 82.7, economy: 59.0, env: 83.9 },
  { rank: 9, country: "United Kingdom", value: 68.1, preUni: 68.1, tvet: 63.4, higherEd: 68.3, rdi: 58.2, ict: 84.2, economy: 60.1, env: 77.5 },
  { rank: 10, country: "Hong Kong, China (SAR)", value: 66.8, preUni: 78.1, tvet: 58.3, higherEd: 55.9, rdi: 45.4, ict: 84.6, economy: 71.2, env: 78.1 },
  { rank: 11, country: "Germany", value: 66.2, preUni: 63.0, tvet: 64.3, higherEd: 60.2, rdi: 61.2, ict: 81.5, economy: 58.6, env: 78.9 },
  { rank: 12, country: "Japan", value: 66.2, preUni: 75.5, tvet: 61.0, higherEd: 50.5, rdi: 63.2, ict: 83.2, economy: 56.2, env: 77.5 },
  { rank: 13, country: "Norway", value: 66.1, preUni: 75.8, tvet: 72.9, higherEd: 57.4, rdi: 44.5, ict: 77.6, economy: 53.1, env: 89.3 },
  { rank: 14, country: "Ireland", value: 66.1, preUni: 75.7, tvet: 67.1, higherEd: 57.7, rdi: 46.2, ict: 75.3, economy: 63.1, env: 83.3 },
  { rank: 15, country: "United Arab Emirates", value: 66.1, preUni: 75.5, tvet: 69.6, higherEd: 55.4, rdi: 37.8, ict: 79.9, economy: 73.2, env: 73.9 },
  { rank: 16, country: "Austria", value: 65.4, preUni: 68.9, tvet: 72.6, higherEd: 56.8, rdi: 51.0, ict: 76.2, economy: 56.6, env: 80.9 },
  { rank: 17, country: "Belgium", value: 65.4, preUni: 75.3, tvet: 73.8, higherEd: 55.9, rdi: 48.4, ict: 74.7, economy: 56.1, env: 77.2 },
  { rank: 18, country: "Iceland", value: 65.2, preUni: 78.0, tvet: 71.2, higherEd: 51.6, rdi: 49.8, ict: 79.2, economy: 48.7, env: 84.0 },
  { rank: 19, country: "Korea (Republic of)", value: 64.4, preUni: 72.7, tvet: 57.7, higherEd: 45.3, rdi: 63.3, ict: 83.4, economy: 60.6, env: 69.5 },
  { rank: 20, country: "France", value: 64.0, preUni: 75.4, tvet: 55.1, higherEd: 55.4, rdi: 54.6, ict: 79.4, economy: 56.2, env: 75.9 },
  { rank: 21, country: "Israel", value: 63.7, preUni: 73.7, tvet: 57.4, higherEd: 46.7, rdi: 64.5, ict: 78.5, economy: 55.8, env: 71.8 },
  { rank: 22, country: "New Zealand", value: 63.2, preUni: 71.0, tvet: 62.3, higherEd: 56.0, rdi: 43.2, ict: 78.9, economy: 54.6, env: 83.3 },
  { rank: 23, country: "Australia", value: 62.2, preUni: 65.8, tvet: 65.1, higherEd: 55.5, rdi: 43.7, ict: 77.0, economy: 55.3, env: 78.7 },
  { rank: 24, country: "Canada", value: 61.1, preUni: 56.6, tvet: 52.8, higherEd: 62.8, rdi: 46.5, ict: 77.7, economy: 58.5, env: 78.4 },
  { rank: 25, country: "Estonia", value: 60.5, preUni: 71.2, tvet: 54.7, higherEd: 53.3, rdi: 36.4, ict: 79.8, economy: 56.7, env: 76.6 },
  { rank: 31, country: "China", value: 57.4, preUni: 76.9, tvet: 65.2, higherEd: 38.9, rdi: 44.4, ict: 61.4, economy: 57.7, env: 57.6 },
  { rank: 41, country: "Costa Rica", value: 51.2, preUni: 64.9, tvet: 63.2, higherEd: 45.7, rdi: 21.9, ict: 61.6, economy: 36.3, env: 72.0 },
  { rank: 52, country: "Romania", value: 48.5, preUni: 58.0, tvet: 46.8, higherEd: 45.1, rdi: 22.6, ict: 60.7, economy: 46.3, env: 66.0 },
  { rank: 57, country: "Mexico", value: 47.5, preUni: 59.1, tvet: 48.2, higherEd: 42.6, rdi: 24.9, ict: 56.3, economy: 44.7, env: 61.1 },
  { rank: 58, country: "Oman", value: 47.5, preUni: 57.4, tvet: 47.6, higherEd: 37.3, rdi: 22.1, ict: 61.9, economy: 48.6, env: 62.2 },
  { rank: 59, country: "Greece", value: 46.8, preUni: 60.1, tvet: 48.2, higherEd: 32.8, rdi: 29.5, ict: 59.3, economy: 37.9, env: 66.6 },
  { rank: 60, country: "Philippines", value: 46.6, preUni: 60.0, tvet: 54.9, higherEd: 38.7, rdi: 22.8, ict: 53.8, economy: 43.2, env: 56.3 },
  { rank: 61, country: "Albania", value: 46.5, preUni: 63.1, tvet: 53.0, higherEd: 38.5, rdi: 21.5, ict: 51.1, economy: 40.7, env: 62.6 },
  { rank: 62, country: "Kazakhstan", value: 46.2, preUni: 68.6, tvet: 48.4, higherEd: 39.9, rdi: 14.5, ict: 57.2, economy: 38.8, env: 61.2 },
  { rank: 63, country: "Georgia", value: 46.0, preUni: 60.1, tvet: 48.9, higherEd: 39.8, rdi: 19.3, ict: 54.2, economy: 43.0, env: 62.3 },
  { rank: 64, country: "Azerbaijan", value: 45.8, preUni: 62.6, tvet: 51.1, higherEd: 38.6, rdi: 14.8, ict: 59.6, economy: 40.7, env: 56.8 },
  { rank: 73, country: "Colombia", value: 44.7, preUni: 59.1, tvet: 45.1, higherEd: 39.6, rdi: 21.9, ict: 56.9, economy: 37.1, env: 58.0 },
  { rank: 80, country: "Iran (Islamic Republic of)", value: 43.5, preUni: 58.1, tvet: 51.2, higherEd: 36.2, rdi: 27.6, ict: 50.0, economy: 37.7, env: 43.8 },
  { rank: 81, country: "Indonesia", value: 43.3, preUni: 53.9, tvet: 44.7, higherEd: 35.6, rdi: 15.4, ict: 55.7, economy: 45.5, env: 57.1 },
  { rank: 83, country: "Morocco", value: 42.6, preUni: 51.6, tvet: 46.9, higherEd: 36.5, rdi: 19.3, ict: 52.3, economy: 44.2, env: 50.0 },
  { rank: 84, country: "Armenia", value: 42.5, preUni: 55.7, tvet: 40.0, higherEd: 32.1, rdi: 19.8, ict: 54.7, economy: 41.3, env: 59.2 },
  { rank: 85, country: "Namibia", value: 42.5, preUni: 63.9, tvet: 47.9, higherEd: 34.4, rdi: 18.2, ict: 42.9, economy: 36.1, env: 59.5 },
  { rank: 86, country: "Guyana", value: 42.4, preUni: 66.1, tvet: 53.1, higherEd: 31.1, rdi: 20.9, ict: 41.1, economy: 35.8, env: 51.6 },
  { rank: 91, country: "Botswana", value: 41.4, preUni: 50.6, tvet: 61.8, higherEd: 32.4, rdi: 17.4, ict: 38.5, economy: 36.0, env: 58.6 },
  { rank: 92, country: "Ecuador", value: 41.3, preUni: 63.7, tvet: 36.4, higherEd: 41.6, rdi: 14.8, ict: 48.2, economy: 31.0, env: 59.2 },
  { rank: 93, country: "Dominican Republic", value: 41.1, preUni: 49.0, tvet: 46.2, higherEd: 31.7, rdi: 19.8, ict: 49.8, economy: 38.5, env: 58.7 },
  { rank: 100, country: "Honduras", value: 39.3, preUni: 52.0, tvet: 53.4, higherEd: 33.2, rdi: 14.3, ict: 37.2, economy: 36.3, env: 53.4 },
  { rank: 101, country: "Ghana", value: 38.7, preUni: 48.6, tvet: 46.8, higherEd: 35.2, rdi: 14.4, ict: 46.7, economy: 31.1, env: 52.2 },
  { rank: 102, country: "Paraguay", value: 38.5, preUni: 56.2, tvet: 35.0, higherEd: 29.2, rdi: 18.9, ict: 41.6, economy: 37.3, env: 58.1 },
  { rank: 103, country: "Algeria", value: 37.5, preUni: 57.3, tvet: 30.7, higherEd: 47.2, rdi: 14.2, ict: 37.5, economy: 32.3, env: 46.5 },
  { rank: 105, country: "Lao PDR", value: 37.4, preUni: 49.7, tvet: 42.7, higherEd: 35.5, rdi: 19.5, ict: 33.8, economy: 34.0, env: 51.6 },
  { rank: 107, country: "Tanzania", value: 36.6, preUni: 40.7, tvet: 42.1, higherEd: 39.6, rdi: 21.3, ict: 37.3, economy: 30.0, env: 49.2 },
  { rank: 110, country: "Nepal", value: 36.2, preUni: 69.6, tvet: 28.3, higherEd: 31.4, rdi: 12.4, ict: 34.1, economy: 32.3, env: 49.5 },
  { rank: 111, country: "Pakistan", value: 35.9, preUni: 46.9, tvet: 42.7, higherEd: 38.7, rdi: 16.0, ict: 37.4, economy: 32.0, env: 38.5 },
  { rank: 112, country: "Bangladesh", value: 35.9, preUni: 43.9, tvet: 49.0, higherEd: 24.1, rdi: 16.4, ict: 43.1, economy: 31.5, env: 46.4 },
  { rank: 113, country: "Senegal", value: 35.0, preUni: 27.5, tvet: 46.4, higherEd: 37.5, rdi: 11.9, ict: 43.6, economy: 33.9, env: 49.2 },
  { rank: 114, country: "Tajikistan", value: 34.7, preUni: 55.1, tvet: 43.4, higherEd: 26.0, rdi: 10.6, ict: 28.9, economy: 34.5, env: 49.4 },
  { rank: 115, country: "Venezuela", value: 34.6, preUni: 54.7, tvet: 33.6, higherEd: 43.1, rdi: 13.5, ict: 34.0, economy: 18.7, env: 50.0 },
  { rank: 116, country: "Cameroon", value: 34.5, preUni: 39.4, tvet: 56.3, higherEd: 27.2, rdi: 17.9, ict: 30.4, economy: 31.2, env: 41.2 },
  { rank: 117, country: "Cote d'Ivoire", value: 34.3, preUni: 40.1, tvet: 47.4, higherEd: 29.9, rdi: 11.8, ict: 41.7, economy: 34.1, env: 35.3 },
  { rank: 118, country: "Eswatini", value: 34.2, preUni: 60.5, tvet: 45.3, higherEd: 26.3, rdi: 8.9, ict: 24.5, economy: 34.5, env: 42.2 },
  { rank: 119, country: "Uganda", value: 33.0, preUni: 32.3, tvet: 44.2, higherEd: 31.7, rdi: 13.1, ict: 34.4, economy: 32.7, env: 47.6 },
  { rank: 120, country: "Gambia", value: 32.7, preUni: 47.7, tvet: 34.6, higherEd: 22.9, rdi: 18.5, ict: 36.9, economy: 28.2, env: 44.0 },
  { rank: 121, country: "Madagascar", value: 31.8, preUni: 37.8, tvet: 48.1, higherEd: 30.0, rdi: 12.6, ict: 19.9, economy: 29.2, env: 51.5 },
  { rank: 123, country: "Malawi", value: 31.7, preUni: 43.5, tvet: 45.0, higherEd: 25.2, rdi: 16.3, ict: 20.1, economy: 28.0, env: 49.4 },
  { rank: 125, country: "Benin", value: 31.3, preUni: 38.6, tvet: 51.2, higherEd: 15.8, rdi: 15.9, ict: 30.3, economy: 28.7, env: 41.8 },
  { rank: 126, country: "Burkina Faso", value: 31.0, preUni: 30.8, tvet: 46.5, higherEd: 31.4, rdi: 14.4, ict: 31.0, economy: 29.5, env: 34.8 },
  { rank: 127, country: "Burundi", value: 30.7, preUni: 41.4, tvet: 42.6, higherEd: 40.7, rdi: 9.9, ict: 18.3, economy: 22.8, env: 43.0 },
  { rank: 128, country: "Myanmar", value: 30.6, preUni: 45.8, tvet: 37.0, higherEd: 26.8, rdi: 13.3, ict: 25.1, economy: 26.6, env: 44.0 },
  { rank: 129, country: "Togo", value: 28.7, preUni: 48.9, tvet: 29.4, higherEd: 23.7, rdi: 8.0, ict: 27.8, economy: 27.3, env: 39.1 },
  { rank: 130, country: "Syria", value: 28.5, preUni: 25.4, tvet: 37.6, higherEd: 23.2, rdi: 13.3, ict: 33.1, economy: 33.8, env: 35.5 },
  { rank: 131, country: "Mozambique", value: 28.3, preUni: 40.8, tvet: 29.4, higherEd: 28.4, rdi: 10.0, ict: 25.2, economy: 28.5, env: 39.4 },
  { rank: 132, country: "Ethiopia", value: 27.4, preUni: 20.9, tvet: 42.3, higherEd: 28.2, rdi: 11.1, ict: 23.4, economy: 27.2, env: 44.6 },
  { rank: 133, country: "Mali", value: 27.3, preUni: 20.7, tvet: 49.3, higherEd: 18.2, rdi: 13.6, ict: 32.8, economy: 25.6, env: 32.9 },
  { rank: 135, country: "Niger", value: 25.7, preUni: 14.1, tvet: 31.5, higherEd: 40.1, rdi: 11.3, ict: 18.9, economy: 33.6, env: 33.1 },
  { rank: 136, country: "Mauritania", value: 25.6, preUni: 27.9, tvet: 38.2, higherEd: 23.1, rdi: 7.8, ict: 22.7, economy: 25.8, env: 37.8 },
  { rank: 138, country: "Chad", value: 21.5, preUni: 14.6, tvet: 39.9, higherEd: 35.6, rdi: 7.4, ict: 11.0, economy: 15.3, env: 29.7 }
];

import { LearningPath, Subject } from './types';

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path_toddler_math',
    subject: Subject.TODDLER_MATH_GAMES,
    title: 'Fun Math Games',
    description: 'A playful introduction to counting, shapes, and early math concepts for toddlers.',
    steps: [
      { id: 'tmath_1', title: 'Counting 10 Apples', description: 'Let us count to 10 with colorful apples.' },
      { id: 'tmath_2', title: 'Shape Sorter', description: 'Find the circles, squares, and triangles.' },
      { id: 'tmath_3', title: 'Bigger vs Smaller', description: 'Comparing sizes of fun animals.' }
    ],
    totalReward: 0.25
  },
  {
    id: 'path_toddler_science',
    subject: Subject.TODDLER_SCIENCE_FUN,
    title: 'Science Explorers',
    description: 'Learn about bugs, colors, and the world around us.',
    steps: [
      { id: 'tsc_1', title: 'Bug Hunt', description: 'What do ants and butterflies do?' },
      { id: 'tsc_2', title: 'Color Mixing', description: 'What happens when blue meets yellow?' }
    ],
    totalReward: 0.15
  },
  {
    id: 'path_toddler_english',
    subject: Subject.TODDLER_ENGLISH_BASICS,
    title: 'English Basics & ABCs',
    description: 'The foundation of reading through fun games and songs.',
    steps: [
      { id: 'teng_1', title: 'Let us sing the Alphabet', description: 'The ABC song.' },
      { id: 'teng_2', title: 'The Letter A', description: 'A is for Apple and Alligator.' },
      { id: 'teng_3', title: 'Rhyming Games', description: 'Cat, Hat, Bat!' }
    ],
    totalReward: 0.25
  },
  {
    id: 'path_toddler_fundamentals',
    subject: Subject.TODDLER_FUNDAMENTALS,
    title: 'Education Fundamentals',
    description: 'Learning kindness, matching, and basic skills.',
    steps: [
      { id: 'tf_1', title: 'Match the Pairs', description: 'Matching socks and shoes.' },
      { id: 'tf_2', title: 'Saying Please and Thank You', description: 'The magic words of kindness.' }
    ],
    totalReward: 0.15
  },
  {
    id: 'path_coding_intro',
    subject: Subject.INTRO_CODING,
    title: 'Zero to Logic',
    description: 'Master the core mental models of computer science before writing a single line of code.',
    steps: [
      { id: 'logic_1', title: 'The Algorithm of Toasts', description: 'Step-by-step thinking for morning routines.' },
      { id: 'logic_2', title: 'Conditional Magic', description: 'If/Else logic in everyday decisions.' },
      { id: 'logic_3', title: 'Looping Through the Day', description: 'Recognizing repetitive patterns in nature.' },
      { id: 'logic_4', title: 'The Variable Chest', description: 'Storing and updating information flow.' },
      { id: 'logic_5', title: 'Functions: The Factory', description: 'Input, transformation, and output.' },
    ],
    totalReward: 0.5
  },
  {
    id: 'path_quantum_physics',
    subject: Subject.QUANTUM_PHYSICS,
    title: 'Reality is a Wave',
    description: 'Explore the counter-intuitive world of subatomic particles and superposition.',
    steps: [
      { id: 'quant_1', title: 'Wave-Particle Duality', description: 'Light acts like both a ripple and a bullet.' },
      { id: 'quant_2', title: 'The Uncertainty Principle', description: 'Why you can\'t know where and how fast at once.' },
      { id: 'quant_3', title: 'Superposition', description: 'Being in two places (states) at the same time.' },
      { id: 'quant_4', title: 'Entanglement', description: '"Spooky action at a distance" defined.' },
      { id: 'quant_5', title: 'Quantum Computing Prep', description: 'From Bits to Qubits: The future of data.' },
    ],
    totalReward: 1.3
  },
  {
    id: 'path_personal_finance',
    subject: Subject.FINANCIAL_LITERACY,
    title: 'Wealth Architecture',
    description: 'Build a fortress around your future through savvy accumulation and risk management.',
    steps: [
      { id: 'fin_1', title: 'The Power of Compounding', description: 'How time turns small pennies into mountains.' },
      { id: 'fin_2', title: 'Budgeting without Boredom', description: 'Zero-based budgeting for modern earners.' },
      { id: 'fin_3', title: 'Asset Classes 101', description: 'Stocks, bonds, crypto, and real estate.' },
      { id: 'fin_4', title: 'The Psychology of Risk', description: 'Why humans make bad financial choices.' },
      { id: 'fin_5', title: 'Tax-Advantaged Growth', description: 'Legal strategies for keeping more of your gain.' },
    ],
    totalReward: 0.5
  },
  {
    id: 'path_creative_writing',
    subject: Subject.CREATIVE_WRITING,
    title: 'Worlds from Words',
    description: 'Learn the craft of storytelling, character design, and world-building.',
    steps: [
      { id: 'write_1', title: 'The Hero\'s Journey', description: 'Classical structure of every great story.' },
      { id: 'write_2', title: 'Showing vs Telling', description: 'Engage the senses instead of listing facts.' },
      { id: 'write_3', title: 'Character Psychology', description: 'Flaws, fears, and internal conflicts.' },
      { id: 'write_4', title: 'Dialogue that Dazzles', description: 'Writing voices that feel real and sharp.' },
      { id: 'write_5', title: 'The Art of the Twist', description: 'Surprising readers through foreshadowing.' },
    ],
    totalReward: 0.5
  },
  {
    id: 'path_math_quest',
    subject: Subject.MATH_QUEST,
    title: 'Math Quest: Primary',
    description: 'A primary-level journey covering arithmetic, fractions, and logic patterns.',
    steps: [
      { id: 'mq_1', title: 'Arithmetic Master', description: 'Basic addition, subtraction, multiplication, and division facts.' },
      { id: 'mq_2', title: 'Fractions & Decimals', description: 'Understanding parts of wholes and percent interactions.' },
      { id: 'mq_3', title: 'Word Problem Detective', description: 'Decoding English sentences into mathematical equations.' },
      { id: 'mq_4', title: 'Geometry Basics', description: 'Lines, angles, perimeters and areas of simple shapes.' },
    ],
    totalReward: 0.4
  },
  {
    id: 'path_global_history',
    subject: Subject.GLOBAL_HISTORY,
    title: 'Global Civilizations',
    description: 'Learn the rise and fall of ancient and modern empires.',
    steps: [
      { id: 'gh_1', title: 'The Fertile Crescent', description: 'Mesopotamia, writing, and early laws.' },
      { id: 'gh_2', title: 'Hellenistic Era', description: 'Greece, Alexander the Great, and early democracy.' },
      { id: 'gh_3', title: 'The Silk Road', description: 'Trade networks connecting East and West.' },
      { id: 'gh_4', title: 'Industrial Revolution', description: 'Machines, labor shifts, and the modern global economy.' },
    ],
    totalReward: 0.45
  }
];


