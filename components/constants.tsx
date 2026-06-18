"use client";

import { Subject, UserLevel } from '../types';

export const LEVEL_CONFIG = {
  [UserLevel.KINDERGARTEN]: {
    label: 'Kids (3-6)',
    theme: 'bg-pink-500',
    icon: 'ðŸŽ¨',
    description: 'Playful games and audio stories'
  },
  [UserLevel.PRIMARY]: {
    label: 'Primary (7-11)',
    theme: 'bg-yellow-500',
    icon: 'ðŸŽ’',
    description: 'Foundational concepts and quizzes'
  },
  [UserLevel.SECONDARY]: {
    label: 'Secondary (12-18)',
    theme: 'bg-blue-600',
    icon: 'ðŸ”¬',
    description: 'Academic subjects and projects'
  },
  [UserLevel.UNIVERSITY]: {
    label: 'University',
    theme: 'bg-indigo-800',
    icon: 'ðŸŽ“',
    description: 'Advanced theory and research'
  },
  [UserLevel.LIFELONG]: {
    label: 'Lifelong Learner',
    theme: 'bg-emerald-600',
    icon: 'ðŸŒ±',
    description: 'Personal growth and skills'
  }
};

export const LEVEL_SUBJECTS: Partial<Record<UserLevel, Subject[]>> = {
  [UserLevel.KINDERGARTEN]: [
    Subject.TODDLER_MATH_GAMES,
    Subject.TODDLER_SCIENCE_FUN,
    Subject.TODDLER_ENGLISH_BASICS,
    Subject.TODDLER_FUNDAMENTALS,
    Subject.PHONICS_ADVENTURE,
    Subject.NUMBER_GAMES,
    Subject.EMOTIONAL_IQ,
    Subject.NATURE_DISCOVERY,
    Subject.ALPHABET_STORY,
    Subject.COLOR_MASTER
  ],
  [UserLevel.PRIMARY]: [
    Subject.TODDLER_MATH_GAMES,
    Subject.TODDLER_SCIENCE_FUN,
    Subject.TODDLER_ENGLISH_BASICS,
    Subject.TODDLER_FUNDAMENTALS,
    Subject.CREATIVE_WRITING,
    Subject.MATH_QUEST,
    Subject.EARTH_SCIENCE,
    Subject.GLOBAL_EXPLORER,
    Subject.INTRO_CODING,
    Subject.ANCIENT_EGYPT,
    Subject.SPACE_PIONEERS
  ],
  [UserLevel.SECONDARY]: [
    Subject.ADVANCED_ALGEBRA,
    Subject.CLASSICAL_PHYSICS,
    Subject.GLOBAL_HISTORY,
    Subject.FINANCIAL_LITERACY,
    Subject.PYTHON_PRO,
    Subject.BIO_GENETICS,
    Subject.MODERN_LIT
  ],
  [UserLevel.UNIVERSITY]: [
    Subject.NEURAL_NETWORKS,
    Subject.MACRO_ECONOMICS,
    Subject.MOLECULAR_BIO,
    Subject.QUANTUM_PHYSICS,
    Subject.COGNITIVE_PSYCH,
    Subject.CYBER_SECURITY,
    Subject.SUSTAINABLE_ENG,
    Subject.HARVARD_CS50,
    Subject.MIT_ALGORITHMS,
    Subject.YALE_PSYCHOLOGY,
    Subject.STANFORD_AI
  ],
  [UserLevel.LIFELONG]: [
    Subject.SCIENCE_WELLBEING,
    Subject.DIGITAL_MARKETING,
    Subject.LEADERSHIP_SKILLS,
    Subject.MINDFULNESS_MEDITATION,
    Subject.DATA_VISUALIZATION,
    Subject.PUBLIC_SPEAKING,
    Subject.PHOTOGRAPHY_PRO,
    Subject.COURSERA_ML,
    Subject.UDEMY_WEB_DEV,
    Subject.GOOGLE_DATA_ANALYTICS,
    Subject.IBM_DATA_SCIENCE,
    Subject.FREECODECAMP_JS,
    Subject.EDX_FINANCE
  ]
};

export const SUBJECT_ICONS: Record<Subject, string> = {
  [Subject.TODDLER_MATH_GAMES]: 'ðŸŽ²',
  [Subject.TODDLER_SCIENCE_FUN]: 'ðŸ§ª',
  [Subject.TODDLER_ENGLISH_BASICS]: 'ðŸ–ï¸',
  [Subject.TODDLER_FUNDAMENTALS]: 'ðŸ§¸',
  [Subject.PHONICS_ADVENTURE]: 'ðŸ”¤',
  [Subject.NUMBER_GAMES]: 'ðŸ”¢',
  [Subject.EMOTIONAL_IQ]: 'ðŸ§¡',
  [Subject.NATURE_DISCOVERY]: 'ðŸŒ¿',
  [Subject.ALPHABET_STORY]: 'ðŸ“š',
  [Subject.COLOR_MASTER]: 'ðŸŽ¨',
  [Subject.CREATIVE_WRITING]: 'âœï¸',
  [Subject.MATH_QUEST]: 'ðŸ“',
  [Subject.EARTH_SCIENCE]: 'ðŸŒ',
  [Subject.GLOBAL_EXPLORER]: 'ðŸ—ºï¸',
  [Subject.INTRO_CODING]: 'ðŸ§©',
  [Subject.ANCIENT_EGYPT]: 'ðŸº',
  [Subject.SPACE_PIONEERS]: 'ðŸš€',
  [Subject.ADVANCED_ALGEBRA]: 'âž—',
  [Subject.CLASSICAL_PHYSICS]: 'âš™ï¸',
  [Subject.GLOBAL_HISTORY]: 'ðŸ›ï¸',
  [Subject.FINANCIAL_LITERACY]: 'ðŸ’°',
  [Subject.PYTHON_PRO]: 'ðŸ',
  [Subject.BIO_GENETICS]: 'ðŸ§¬',
  [Subject.MODERN_LIT]: 'ðŸ“–',
  [Subject.NEURAL_NETWORKS]: 'ðŸ§ ',
  [Subject.MACRO_ECONOMICS]: 'ðŸ“ˆ',
  [Subject.MOLECULAR_BIO]: 'ðŸ”¬',
  [Subject.QUANTUM_PHYSICS]: 'âš›ï¸',
  [Subject.COGNITIVE_PSYCH]: 'ðŸ‘¤',
  [Subject.CYBER_SECURITY]: 'ðŸ”',
  [Subject.SUSTAINABLE_ENG]: 'ðŸ—ï¸',
  [Subject.SCIENCE_WELLBEING]: 'âœ¨',
  [Subject.DIGITAL_MARKETING]: 'ðŸ“±',
  [Subject.LEADERSHIP_SKILLS]: 'ðŸ‘”',
  [Subject.MINDFULNESS_MEDITATION]: 'ðŸ§˜',
  [Subject.DATA_VISUALIZATION]: 'ðŸ“Š',
  [Subject.PUBLIC_SPEAKING]: 'ðŸ“¢',
  [Subject.PHOTOGRAPHY_PRO]: 'ðŸ“·',
  [Subject.QUANTUM_COMPUTING]: 'ðŸ’ ',
  [Subject.GENOMIC_MEDICINE]: 'ðŸ’Š',
  [Subject.ASTROPHYSICS]: 'ðŸ”­',
  [Subject.AI_ETHICS]: 'ðŸ¤–',
  [Subject.HARVARD_CS50]: 'ðŸŽ“',
  [Subject.MIT_ALGORITHMS]: 'ðŸ”¢',
  [Subject.COURSERA_ML]: 'ðŸ¤–',
  [Subject.UDEMY_WEB_DEV]: 'ðŸŒ',
  [Subject.YALE_PSYCHOLOGY]: 'ðŸ§ ',
  [Subject.STANFORD_AI]: 'ðŸ¦¾',
  [Subject.GOOGLE_DATA_ANALYTICS]: 'ðŸ“Š',
  [Subject.IBM_DATA_SCIENCE]: 'ðŸ“ˆ',
  [Subject.FREECODECAMP_JS]: 'ðŸ’»',
  [Subject.EDX_FINANCE]: 'ðŸ’µ'
};

export const PREMIUM_SUBJECTS: Subject[] = [
  Subject.QUANTUM_COMPUTING,
  Subject.GENOMIC_MEDICINE,
  Subject.ASTROPHYSICS,
  Subject.AI_ETHICS
];

export const isPremiumSubject = (subject: Subject) => PREMIUM_SUBJECTS.includes(subject);




