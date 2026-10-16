"use client";

import { useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import type { LessonRow } from "@/lib/schema";

const SAMPLE =
  "so basically we kept getting this weird hydration mismatch on the pricing page and it turned out we were formatting the price with the user's locale on the server but the client was rendering with a different default locale so the html didn't match. don't format dates or currency during server render, move anything locale dependent into a client component with a mounted check or use a fixed locale on the server side. tagging it react, hydration, i18n.";

export default function CapturePage() {
  const [transcript, setTranscript] = useState("");
  const [sourceContext, setSourceContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setLesson(null);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, sourceContext }),
      });
      const data = await res.json();
      if (data.lesson) setLesson(data.lesson);
      if (!res.ok) setError(data.error ?? `Request failed (${res.status})`);
      else if (data.lesson?.status === "unstructured") setError(null);
    } catch {
      setError("Network error — is the server up?");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = transcript.trim().length >= 40 && !loading;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <a href="/" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← scar tissue
        </a>
        <a href="/memory" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          memory →
        </a>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Capture a scar
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        Hold <b className="text-zinc-200">Wispr Flow</b> and say what broke, why, and
        what to do instead — the way you’d tell a colleague. Paste what Flow wrote.
        It gets structured into an imperative lesson your coding agents can use.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="transcript" className="text-sm font-medium text-zinc-300">
              Dictation <span className="text-zinc-600">(from Wispr Flow)</span>
            </label>
            <button
              onClick={() => setTranscript(SAMPLE)}
              className="text-xs text-zinc-500 underline decoration-dotted underline-offset-4 transition hover:text-zinc-300"
              type="button"
            >
              load a sample dictate (input only — structuring runs live)
            </button>
          </div>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={7}
            placeholder="okay so the build kept failing because… we tried X but that broke Y because… so never do X, instead do Z…"
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-zinc-600">
            {transcript.trim().length} chars
          </p>
        </div>

        <div>
          <label htmlFor="source" className="mb-2 block text-sm font-medium text-zinc-300">
            Error / log snippet <span className="text-zinc-600">(optional, grounds the lesson)</span>
          </label>
          <textarea
            id="source"
            value={sourceContext}
            onChange={(e) => setSourceContext(e.target.value)}
            rows={3}
            placeholder="TypeError: cannot read properties of undefined …"
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
          />
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Structuring (live LLM call)…" : "Structure this"}
        </button>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {lesson?.status === "unstructured" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Your dictation was saved (id <code>{lesson.id}</code>) but couldn’t be
            structured yet. Nothing is lost —{" "}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetch(`/api/lessons/${lesson.id}/retry`, { method: "POST" })
                  .then((r) => r.json())
                  .then((data) => {
                    setLesson(data.lesson ?? lesson);
                    if (data.error) setError(data.error);
                    else setError(null);
                  })
                  .catch(() => setError("Retry failed — network error."))
                  .finally(() => setLoading(false));
              }}
              className="underline underline-offset-4 hover:text-amber-100"
            >
              retry structuring
            </button>
            .
          </div>
        )}

        {lesson && lesson.status !== "unstructured" && (
          <LessonCard lesson={lesson} />
        )}
      </div>
    </main>
  );
}
