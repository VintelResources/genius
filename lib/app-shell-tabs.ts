export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

export type ShellTabKey =
  | "trivia"
  | "lessons"
  | "paths"
  | "exam"
  | "wallet"
  | "leaderboard"
  | "foundation"
  | "referrals"
  | "payout"
  | "tokenomics" | "languages" | "admin";

export type ShellTab = {
  key: ShellTabKey;
  label: string;
  description: string;
};

export const SHELL_TABS: ShellTab[] = [
  {
    key: "trivia",
    label: "Play",
    description: "Fast AI trivia rounds and daily challenge."
  },
  {
    key: "lessons",
    label: "Courses",
    description: "Browse course categories and study modules."
  },
  {
    key: "paths",
    label: "Daily",
    description: "Follow structured learning journeys."
  },
  {
    key: "exam",
    label: "Exam",
    description: "Take 10-question adaptive exams and unlock rewards."
  },
  {
    key: "wallet",
    label: "Wallet",
    description: "Track GENI balance, rewards, and transfers."
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    description: "See learner rankings and progress."
  },
  {
    key: "foundation",
    label: "Foundation",
    description: "View education mission and treasury impact."
  },
  {
    key: "referrals",
    label: "Referrals",
    description: "Invite learners and track referral earnings."
  },
  {
    key: "payout",
    label: "Payout",
    description: "Review reward claim status and payout flow."
  },
  {
    key: "tokenomics",
    label: "Tokenomics",
    description: "See GENI utility, supply, and reward logic."
  },

  {
    key: "languages",
    label: "Languages",
    description: "Learn Russian, French, English, Spanish, Latin, Afrikaans, Swahili, Chinese, and Yoruba."
  },
  {
    key: "admin",
    label: "Admin",
    description: "Manage content, treasury, and operations."
  }
];

export const LEVEL_LABELS: Record<LearnerBand, string> = {
  toddlers: "Toddlers",
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary"
};




