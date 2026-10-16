"use client";

import { lessonToMarkdown, type LessonRow } from "@/lib/schema";
import { useState } from "react";

const statusStyles: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  closed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  unstructured: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

export function LessonCard({ lesson }: { lesson: LessonRow }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(lessonToMarkdown(lesson));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article className="animate-[fadeIn_0.4s_ease-out] rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-medium uppercase tracking-wide ${statusStyles[lesson.status] ?? statusStyles.open}`}
        >
          {lesson.status === "unstructured" ? "needs retry" : lesson.status}
        </span>
        {lesson.context && (
          <span className="text-xs text-zinc-500">{lesson.context}</span>
        )}
        <span className="ml-auto font-mono text-xs text-zinc-600">{lesson.id}</span>
      </header>

      {lesson.rule && (
        <h3 className="mb-4 text-lg font-semibold leading-snug text-zinc-100">
          {lesson.rule}
        </h3>
      )}

      <div className="space-y-2.5 text-sm leading-relaxed">
        {lesson.wrong && (
          <p className="flex gap-2">
            <span aria-hidden>❌</span>
            <span className="text-zinc-400">
              <b className="font-medium text-rose-300/90">Wrong:</b> {lesson.wrong}
            </span>
          </p>
        )}
        {lesson.right && (
          <p className="flex gap-2">
            <span aria-hidden>✅</span>
            <span className="text-zinc-400">
              <b className="font-medium text-emerald-300/90">Right:</b> {lesson.right}
            </span>
          </p>
        )}
        {lesson.why && (
          <p className="flex gap-2">
            <span aria-hidden>🧠</span>
            <span className="text-zinc-400">
              <b className="font-medium text-sky-300/90">Why:</b> {lesson.why}
            </span>
          </p>
        )}
        {lesson.fixNote && (
          <p className="flex gap-2">
            <span aria-hidden>🔧</span>
            <span className="text-zinc-400">
              <b className="font-medium text-zinc-300">Fix:</b> {lesson.fixNote}
            </span>
          </p>
        )}
      </div>

      {lesson.tags.length > 0 && (
        <footer className="mt-4 flex flex-wrap gap-2">
          {lesson.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-zinc-400"
            >
              #{t}
            </span>
          ))}
        </footer>
      )}

      <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
        <button
          onClick={copy}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
        >
          {copied ? "Copied ✓" : "Copy as markdown"}
        </button>
        <details className="text-xs text-zinc-600">
          <summary className="cursor-pointer select-none hover:text-zinc-400">
            raw dictation
          </summary>
          <p className="mt-2 max-w-xl whitespace-pre-wrap italic text-zinc-500">
            “{lesson.rawTranscript}”
          </p>
        </details>
      </div>
    </article>
  );
}
