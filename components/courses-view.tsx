"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getAiCourses } from "@/actions/aiCourses";
import type { AiGeneratedCourse, LearnerBand } from "@/lib/ai-course-engine";

const LEVELS: Array<{ key: LearnerBand | "all"; label: string }> = [
  { key: "all", label: "All Levels" },
  { key: "toddlers", label: "Toddlers" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "tertiary", label: "Tertiary" }
];

const SUBJECTS = [
  "all",
  "Early Learning",
  "English",
  "Science",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Accounts",
  "Economics",
  "Forex and Markets",
  "Engineering",
  "Communication Skills",
  "Politics",
  "Current Affairs"
] as const;

function levelLabel(level: LearnerBand) {
  switch (level) {
    case "toddlers":
      return "Toddlers";
    case "primary":
      return "Primary";
    case "secondary":
      return "Secondary";
    case "tertiary":
      return "Tertiary";
    default:
      return level;
  }
}

export default function CoursesView() {
  const [courses, setCourses] = useState<AiGeneratedCourse[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LearnerBand | "all">("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [status, setStatus] = useState("Loading AI-generated courses...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCourses("all", "all");
  }, []);

  function loadCourses(
    learnerBand: LearnerBand | "all",
    subject: string
  ) {
    startTransition(async () => {
      setStatus("Generating AI courses...");
      const response = await getAiCourses({
        learnerBand,
        subject,
        courseCount: 16
      });

      setCourses(response.courses);
      setStatus(`Loaded ${response.courses.length} AI-generated courses.`);
    });
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const levelMatch = selectedLevel === "all" || course.learnerBand === selectedLevel;
      const subjectMatch = selectedSubject === "all" || course.subject === selectedSubject;
      return levelMatch && subjectMatch;
    });
  }, [courses, selectedLevel, selectedSubject]);

  function updateLevel(next: LearnerBand | "all") {
    setSelectedLevel(next);
    loadCourses(next, selectedSubject);
  }

  function updateSubject(next: string) {
    setSelectedSubject(next);
    loadCourses(selectedLevel, next);
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Courses
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">
          AI-Generated Course Library
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          The Courses tab now loads a broad set of in-house AI-generated courses across levels and subjects,
          with relevant modules and learning outcomes for each topic.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
        <div className="text-xs uppercase tracking-[0.25em] text-white/60">
          Filter by Level
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((level) => {
            const active = selectedLevel === level.key;

            return (
              <button
                key={level.key}
                type="button"
                onClick={() => updateLevel(level.key)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/75"
                }`}
              >
                {level.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-xs uppercase tracking-[0.25em] text-white/60">
          Filter by Subject
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => {
            const active = selectedSubject === subject;

            return (
              <button
                key={subject}
                type="button"
                onClick={() => updateSubject(subject)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100"
                    : "border-white/10 bg-white/5 text-white/75"
                }`}
              >
                {subject === "all" ? "All Subjects" : subject}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {filteredCourses.map((course) => (
          <article
            key={course.id}
            className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  {levelLabel(course.learnerBand)} • {course.subject}
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {course.title}
                </h3>
              </div>

              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                {course.modules.length} Modules
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/75">
              {course.summary}
            </p>

            <div className="mt-5">
              <div className="text-sm font-semibold text-white">Learning Outcomes</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {course.outcomes.map((outcome) => (
                  <span
                    key={outcome}
                    className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100"
                  >
                    {outcome}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-white">Modules</div>
              <div className="mt-3 space-y-3">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {index + 1}. {module.title}
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                          {module.summary}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                        {module.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
        {isPending ? "Generating..." : status}
      </div>
    </section>
  );
}

