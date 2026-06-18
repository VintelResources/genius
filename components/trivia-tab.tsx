"use client";

import * as TriviaModule from "@/components/trivia-view";

const ResolvedTriviaView =
  typeof (TriviaModule as any).default === "function"
    ? (TriviaModule as any).default
    : typeof (TriviaModule as any).TriviaView === "function"
      ? (TriviaModule as any).TriviaView
      : null;

export default function TriviaTab() {
  if (!ResolvedTriviaView) {
    return (
      <section className="rounded-[28px] border border-red-300/20 bg-red-500/10 p-6 text-red-100">
        <div className="text-xs uppercase tracking-[0.25em]">Trivia Import Error</div>
        <h2 className="mt-2 text-2xl font-black">TriviaView is not exporting a React component.</h2>
        <p className="mt-2 text-sm">
          Check components/trivia-view.tsx and ensure it ends with: export default function TriviaView()
        </p>
      </section>
    );
  }

  return <ResolvedTriviaView />;
}

