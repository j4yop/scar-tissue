"use client";

import { useCallback, useEffect, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import type { LessonRow } from "@/lib/schema";

export default function MemoryPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      if (status) params.set("status", status);
      const res = await fetch(`/api/lessons?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setLessons(data.lessons);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, tag, status]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const allTags = [...new Set(lessons.flatMap((l) => l.tags))].slice(0, 12);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <a href="/" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← scar tissue
        </a>
        <a href="/capture" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          + capture
        </a>
        <a href="/connect" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          connect
        </a>
        <a href="/import" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          wispr import
        </a>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">The memory</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Every scar captured so far — searchable by what happened, why, or what to do.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search lessons…"
          className="min-w-56 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-300 focus:outline-none"
        >
          <option value="">any status</option>
          <option value="open">open</option>
          <option value="closed">closed</option>
        </select>
      </div>

      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? "" : t)}
              className={`rounded-md px-2 py-0.5 font-mono text-xs transition ${
                tag === t
                  ? "bg-orange-600/80 text-white"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-5">
        {loading && <p className="text-sm text-zinc-500">loading…</p>}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}
        {!loading && !error && lessons.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nothing here yet —{" "}
            <a href="/capture" className="text-orange-400 underline underline-offset-4">
              capture your first scar
            </a>
            .
          </p>
        )}
        {lessons.map((l) => (
          <LessonCard key={l.id} lesson={l} />
        ))}
      </div>
    </main>
  );
}
