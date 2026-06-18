"use client";

import { useEffect, useMemo, useState } from "react";
import { getTriviaSubjects, type LearnerBand } from "@/lib/trivia-catalog";

type TriviaSubjectPickerProps = {
  learnerBand: LearnerBand;
  onStart: (input: {
    learnerBand: LearnerBand;
    subjectId: string;
    subjectTitle: string;
    topicId: string;
    topicTitle: string;
  }) => void;
};

export function TriviaSubjectPicker({ learnerBand, onStart }: TriviaSubjectPickerProps) {
  const subjects = useMemo(() => getTriviaSubjects(learnerBand), [learnerBand]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id ?? "");

  useEffect(() => {
    setSelectedSubjectId(subjects[0]?.id ?? "");
  }, [subjects]);

  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0];

  const topics = selectedSubject?.topics ?? [];
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id ?? "");

  useEffect(() => {
    setSelectedTopicId(topics[0]?.id ?? "");
  }, [selectedSubjectId, learnerBand]);

  const selectedTopic =
    topics.find((topic) => topic.id === selectedTopicId) ?? topics[0];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Select a Subject
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Choose trivia by subject
        </h3>
        <p className="mt-1 text-sm text-slate-300">
          Pick a subject first, then choose a focused topic before starting your challenge.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const active = subject.id === selectedSubjectId;

          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => setSelectedSubjectId(subject.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10"
              }`}
            >
              <div className="text-base font-semibold text-white">{subject.title}</div>
              <div className="mt-1 text-sm text-slate-300">{subject.description}</div>
              <div className="mt-3 text-xs text-cyan-300">{subject.topics.length} topics</div>
            </button>
          );
        })}
      </div>

      {selectedSubject ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="mb-3">
            <div className="text-lg font-semibold text-white">{selectedSubject.title}</div>
            <div className="text-sm text-slate-300">{selectedSubject.description}</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => {
              const active = topic.id === selectedTopicId;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10"
                  }`}
                >
                  <div className="text-base font-semibold text-white">{topic.title}</div>
                  <div className="mt-1 text-sm text-slate-300">{topic.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <div className="text-sm font-medium text-white">
                Ready: {selectedSubject.title} / {selectedTopic?.title ?? "Select a topic"}
              </div>
              <div className="text-xs text-slate-400">
                AI will generate questions from this focused area.
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedSubject || !selectedTopic}
              onClick={() => {
                if (!selectedSubject || !selectedTopic) return;

                onStart({
                  learnerBand,
                  subjectId: selectedSubject.id,
                  subjectTitle: selectedSubject.title,
                  topicId: selectedTopic.id,
                  topicTitle: selectedTopic.title
                });
              }}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Trivia
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

