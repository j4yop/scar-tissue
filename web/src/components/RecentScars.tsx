"use client";

import { useEffect, useState } from "react";
import type { LessonRow } from "@/lib/schema";

/**
 * A live glimpse of the memory on the landing page — real rows from the DB,
 * fetched client-side (same source as /memory). Not hardcoded.
 */
export function RecentScars() {
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);

  useEffect(() => {
    fetch("/api/lessons?limit=3")
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons ?? []))
      .catch(() => setLessons([]));
  }, []);

  if (lessons === null) {
    return (
      <p className="mt-4 text-xs text-zinc-600">loading the latest scars…</p>
    );
  }
  if (!lessons.length) {
    return (
      <p className="mt-4 text-xs text-zinc-600">
        No scars captured yet —{" "}
        <a href="/capture" className="text-orange-400 underline underline-offset-4">
          be the first
        </a>
        .
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {lessons.map((l) => (
        <div
          key={l.id}
          className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
        >
          <span className="font-mono text-xs text-zinc-600">#{l.tags[0] ?? "scar"}</span>
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">
            {l.rule || l.rawTranscript}
          </span>
        </div>
      ))}
      <a
        href="/memory"
        className="inline-block text-xs text-orange-400 underline underline-offset-4"
      >
        see all →
      </a>
    </div>
  );
}