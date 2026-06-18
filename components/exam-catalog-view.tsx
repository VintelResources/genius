"use client";

import { useMemo, useState } from "react";

type LevelKey = "all" | "toddlers" | "primary" | "secondary" | "tertiary" | "outsourced";

type DifficultyKey = "Easy" | "Medium" | "Hard";

type SubjectCard = {
  level: Exclude<LevelKey, "all">;
  emoji: string;
  title: string;
};

type AcademicRecord = {
  date: string;
  score: string;
  status: "FAILED" | "PASSED";
};

const SUBJECTS: SubjectCard[] = [
  { level: "toddlers", emoji: "🧩", title: "Fun Math Games" },
  { level: "toddlers", emoji: "🧩", title: "Science Explorers" },
  { level: "toddlers", emoji: "🧩", title: "English Basics & ABCs" },
  { level: "toddlers", emoji: "🧩", title: "Education Fundamentals" },

  { level: "primary", emoji: "🎒", title: "Fun Math Games" },
  { level: "primary", emoji: "🎒", title: "Science Explorers" },
  { level: "primary", emoji: "🎒", title: "English Basics & ABCs" },
  { level: "primary", emoji: "🎒", title: "Education Fundamentals" },
  { level: "primary", emoji: "🎒", title: "Mathematics Quest" },
  { level: "primary", emoji: "🎒", title: "The Living Earth" },
  { level: "primary", emoji: "🎒", title: "World Geography" },
  { level: "primary", emoji: "🎒", title: "Nature & Animals" },

  { level: "secondary", emoji: "🔬", title: "Intro to Logic & Code" },
  { level: "secondary", emoji: "🔬", title: "Creative Writing Masterclass" },
  { level: "secondary", emoji: "🔬", title: "Personal Finance & Wealth" },
  { level: "secondary", emoji: "🔬", title: "Algebra & Trigonometry" },
  { level: "secondary", emoji: "🔬", title: "Classical Mechanics" },
  { level: "secondary", emoji: "🔬", title: "Global Civilizations" },

  { level: "tertiary", emoji: "🏛️", title: "Software Engineering with Python" },
  { level: "tertiary", emoji: "🏛️", title: "Biology: DNA & Genetics" },
  { level: "tertiary", emoji: "🏛️", title: "Neural Networks & Deep Learning" },
  { level: "tertiary", emoji: "🏛️", title: "Quantum Mechanics II" },
  { level: "tertiary", emoji: "🏛️", title: "Advanced Cyber Security" },
  { level: "tertiary", emoji: "🏛️", title: "Macro-Economic Theory" },

  { level: "outsourced", emoji: "🌐", title: "Harvard CS50: Intro to Computer Science" },
  { level: "outsourced", emoji: "🌐", title: "MIT 6.006: Intro to Algorithms" },
  { level: "outsourced", emoji: "🌐", title: "Coursera: Machine Learning by Andrew Ng" },
  { level: "outsourced", emoji: "🌐", title: "Udemy: Complete Web Development Bootcamp" },
  { level: "outsourced", emoji: "🌐", title: "Yale: Introduction to Psychology" },
  { level: "outsourced", emoji: "🌐", title: "Stanford: Artificial Intelligence Principles" },
  { level: "outsourced", emoji: "🌐", title: "Google: Data Analytics Professional" },
  { level: "outsourced", emoji: "🌐", title: "IBM: Data Science Professional" },
  { level: "outsourced", emoji: "🌐", title: "freeCodeCamp: JavaScript Algorithms" },
  { level: "outsourced", emoji: "🌐", title: "edX: Finance for Everyone" }
];

const ACADEMIC_RECORD: AcademicRecord[] = [
  { date: "5/3/2026", score: "9/10", status: "FAILED" },
  { date: "5/1/2026", score: "8/10", status: "FAILED" },
  { date: "4/26/2026", score: "5/10", status: "FAILED" }
];

const LEVEL_LABELS: Record<LevelKey, string> = {
  all: "All Subjects",
  toddlers: "Toddlers",
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
  outsourced: "Outsourced"
};

function titleizeLevel(level: Exclude<LevelKey, "all">) {
  if (level === "outsourced") {
    return "Outsourced Global Courses";
  }

  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function ExamCatalogView() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState<LevelKey>("all");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("Easy");
  const [selectedSubject, setSelectedSubject] = useState<SubjectCard | null>(SUBJECTS[0]);
  const [status, setStatus] = useState("Choose a subject to prepare an exam.");

  const filteredSubjects = useMemo(() => {
    return SUBJECTS.filter((subject) => {
      const matchesLevel = activeLevel === "all" || subject.level === activeLevel;
      const matchesSearch =
        search.trim().length === 0 ||
        subject.title.toLowerCase().includes(search.trim().toLowerCase());

      return matchesLevel && matchesSearch;
    });
  }, [activeLevel, search]);

  const groupedSubjects = useMemo(() => {
    const levels: Exclude<LevelKey, "all">[] = [
      "toddlers",
      "primary",
      "secondary",
      "tertiary",
      "outsourced"
    ];

    return levels
      .map((level) => ({
        level,
        items: filteredSubjects.filter((subject) => subject.level === level)
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredSubjects]);

  function startExam() {
    if (!selectedSubject) {
      setStatus("Select a subject first.");
      return;
    }

    setStatus(
      `Exam ready: ${selectedSubject.title} • ${titleizeLevel(selectedSubject.level)} • ${difficulty}`
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Course Examinations
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">
          Choose a specific discipline to take an exam.
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-white/75">
          You must score <span className="font-semibold text-white">90% or higher</span> to earn Genius coins.
          Select your academic level and corresponding subject.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subjects..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(LEVEL_LABELS) as LevelKey[]).map((level) => {
                const active = activeLevel === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setActiveLevel(level)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                        : "border-white/10 bg-white/5 text-white/80"
                    }`}
                  >
                    {LEVEL_LABELS[level]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-5 rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            {groupedSubjects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                No subjects match your search.
              </div>
            ) : (
              groupedSubjects.map((group) => (
                <div key={group.level} className="space-y-3">
                  <div className="text-lg font-bold text-white">{titleizeLevel(group.level)}</div>

                  <div className="grid gap-3">
                    {group.items.map((subject) => {
                      const active =
                        selectedSubject?.title === subject.title &&
                        selectedSubject?.level === subject.level;

                      return (
                        <button
                          key={`${subject.level}-${subject.title}`}
                          type="button"
                          onClick={() => setSelectedSubject(subject)}
                          className={`rounded-[24px] border p-4 text-left transition ${
                            active
                              ? "border-cyan-300/30 bg-cyan-400/10"
                              : "border-white/10 bg-black/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{subject.emoji}</div>
                            <div className="text-base font-semibold text-white">{subject.title}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Selected Discipline
            </div>
            <div className="mt-3 text-2xl font-bold text-white">
              {selectedSubject ? selectedSubject.title : "No subject selected"}
            </div>
            <div className="mt-2 text-sm text-white/80">
              {selectedSubject ? titleizeLevel(selectedSubject.level) : "Pick a subject from the list."}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Exam Configuration
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Format</div>
                <div className="mt-2 text-xl font-bold text-white">10 Questions</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Requirement</div>
                <div className="mt-2 text-xl font-bold text-white">100% to earn G Coins</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Difficulty</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["Easy", "Medium", "Hard"] as DifficultyKey[]).map((item) => {
                    const active = difficulty === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDifficulty(item)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-white/80"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startExam}
              disabled={!selectedSubject}
              className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
            >
              Start Exam
            </button>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {status}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Your Academic Record
            </div>

            <div className="mt-4 space-y-3">
              {ACADEMIC_RECORD.map((record, index) => (
                <div
                  key={`${record.date}-${record.score}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-white/65">{record.date}</div>
                      <div className="mt-2 text-xl font-bold text-white">{record.score}</div>
                    </div>

                    <div
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        record.status === "PASSED"
                          ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
                          : "border-red-300/30 bg-red-500/15 text-red-100"
                      }`}
                    >
                      {record.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

