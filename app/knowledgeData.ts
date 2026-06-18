import { LearningPaths, Subject } from './types';

export const LEARNING_PATHS: LearningPaths[] = [
  {
    id: 'crypto-101',
    title: 'Crypto Fundamentals',
    subject: 'CRYPTO',
  },
  {
    id: 'forex-basics',
    title: 'Introduction to Forex',
    subject: 'FOREX',
  },
  {
    id: 'stocks-advanced',
    title: 'Market Analysis',
    subject: 'STOCKS',
  }
];

export const SUBJECT_ICONS: Record<Subject, string> = {
  CRYPTO: '₿',
  FOREX: '💱',
  STOCKS: '📈',
};


export type GKIEntry = {
  rank: number;
  country: string;
  score: number;
  value?: number;
  incomeGroup?: string;
  region?: string;
};

export const GKI_2020_DATA: GKIEntry[] = [
  { rank: 1, country: "Switzerland", score: 73.6, value: 73.6, incomeGroup: "High income", region: "Europe" },
  { rank: 2, country: "United States", score: 71.1, value: 71.1, incomeGroup: "High income", region: "North America" },
  { rank: 3, country: "Finland", score: 70.8, value: 70.8, incomeGroup: "High income", region: "Europe" },
  { rank: 4, country: "Sweden", score: 70.7, value: 70.7, incomeGroup: "High income", region: "Europe" },
  { rank: 5, country: "Netherlands", score: 69.8, value: 69.8, incomeGroup: "High income", region: "Europe" },
  { rank: 10, country: "United Kingdom", score: 67.5, value: 67.5, incomeGroup: "High income", region: "Europe" },
  { rank: 25, country: "China", score: 61.2, value: 61.2, incomeGroup: "Upper middle income", region: "Asia" },
  { rank: 50, country: "South Africa", score: 45.2, value: 45.2, incomeGroup: "Upper middle income", region: "Africa" },
  { rank: 90, country: "Zambia", score: 31.4, value: 31.4, incomeGroup: "Lower middle income", region: "Africa" }
];


