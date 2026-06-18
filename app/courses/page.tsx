"use client";

import CurriculumTabs from "@/components/curriculum-tabs";

export default function CoursesPage() {
  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_30%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <CurriculumTabs title="Standard Curriculum" subtitle="Category Tabs" />
      </div>
    </main>
  );
}

