"use client";

import { useState } from "react";
import LevelCurriculum from "@/components/level-curriculum";
import type { LearnerBand } from "@/lib/app-shell-tabs";
import { LEVEL_LABELS } from "@/lib/app-shell-tabs";

type CurriculumTabsProps = {
  title: string;
  subtitle: string;
};

export default function CurriculumTabs({ title, subtitle }: CurriculumTabsProps) {
  const [activeLevel, setActiveLevel] = useState<LearnerBand>("toddlers");

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">{title}</div>
        <h2 className="mt-2 text-3xl font-black text-white">{subtitle}</h2>
        <p className="mt-2 text-sm text-white/70">
          Choose a category tab to load all standard curriculum courses under that level.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {(Object.keys(LEVEL_LABELS) as LearnerBand[]).map((level) => {
            const active = activeLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveLevel(level)}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
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

      <LevelCurriculum
        level={activeLevel}
        title={LEVEL_LABELS[activeLevel]}
        subtitle={`${LEVEL_LABELS[activeLevel]} Curriculum`}
        showBackLink={false}
      />
    </div>
  );
}

