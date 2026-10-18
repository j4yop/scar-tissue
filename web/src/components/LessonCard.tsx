"use client";

import { lessonToMarkdown, type LessonRow } from "@/lib/schema";
import { useState } from "react";

const statusStyles: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  closed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  unstructured: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

export function LessonCard({ lesson }: { lesson: LessonRow }) {
  const [current, setCurrent] = useState<LessonRow>(lesson);
  const [copied, setCopied] = useState(false);
  const [fixNote, setFixNote] = useState("");
  const [busy, setBusy] = useState<null | "retry" | "close" | "edit">(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    rule: "",
    wrong: "",
    right: "",
    why: "",
    tags: "",
    context: "",
  });

  const copy = async () => {
    await navigator.clipboard.writeText(lessonToMarkdown(current));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const retry = async () => {
    setBusy("retry");
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${current.id}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Retry failed");
      setCurrent(data.lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setBusy(null);
    }
  };

  const close = async () => {
    if (!fixNote.trim()) return;
    setBusy("close");
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixNote: fixNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not close lesson");
      setCurrent(data.lesson);
      setFixNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not close lesson");
    } finally {
      setBusy(null);
    }
  };

  const startEdit = () => {
    setError(null);
    setDraft({
      rule: current.rule,
      wrong: current.wrong,
      right: current.right,
      why: current.why,
      tags: current.tags.join(", "),
      context: current.context,
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setBusy("edit");
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule: draft.rule.trim(),
          wrong: draft.wrong.trim(),
          right: draft.right.trim(),
          why: draft.why.trim(),
          context: draft.context.trim() || "general",
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save changes");
      setCurrent(data.lesson);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="animate-[fadeIn_0.4s_ease-out] rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-medium uppercase tracking-wide ${statusStyles[current.status] ?? statusStyles.open}`}
        >
          {current.status === "unstructured" ? "needs retry" : current.status}
        </span>
        {current.context && (
          <span className="text-xs text-zinc-500">{current.context}</span>
        )}
        <span className="ml-auto font-mono text-xs text-zinc-600">{current.id}</span>
      </header>

      {editing ? (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Rule
            </span>
            <textarea
              value={draft.rule}
              onChange={(e) => setDraft((d) => ({ ...d, rule: e.target.value }))}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-200 focus:border-white/25 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Wrong
            </span>
            <textarea
              value={draft.wrong}
              onChange={(e) => setDraft((d) => ({ ...d, wrong: e.target.value }))}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Right
            </span>
            <textarea
              value={draft.right}
              onChange={(e) => setDraft((d) => ({ ...d, right: e.target.value }))}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Why
            </span>
            <textarea
              value={draft.why}
              onChange={(e) => setDraft((d) => ({ ...d, why: e.target.value }))}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Tags (comma-separated)
              </span>
              <input
                value={draft.tags}
                onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Context
              </span>
              <input
                value={draft.context}
                onChange={(e) => setDraft((d) => ({ ...d, context: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={busy !== null || draft.rule.trim().length < 5}
              className="rounded-lg border border-orange-500/40 bg-orange-600/20 px-3 py-1.5 text-xs text-orange-200 transition hover:bg-orange-600/30 disabled:opacity-40"
            >
              {busy === "edit" ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={busy !== null}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/5 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {current.rule && (
            <h3 className="mb-4 text-lg font-semibold leading-snug text-zinc-100">
              {current.rule}
            </h3>
          )}

          <div className="space-y-2.5 text-sm leading-relaxed">
            {current.wrong && (
              <p className="flex gap-2">
                <span aria-hidden>❌</span>
                <span className="text-zinc-400">
                  <b className="font-medium text-rose-300/90">Wrong:</b> {current.wrong}
                </span>
              </p>
            )}
            {current.right && (
              <p className="flex gap-2">
                <span aria-hidden>✅</span>
                <span className="text-zinc-400">
                  <b className="font-medium text-emerald-300/90">Right:</b> {current.right}
                </span>
              </p>
            )}
            {current.why && (
              <p className="flex gap-2">
                <span aria-hidden>🧠</span>
                <span className="text-zinc-400">
                  <b className="font-medium text-sky-300/90">Why:</b> {current.why}
                </span>
              </p>
            )}
            {current.fixNote && (
              <p className="flex gap-2">
                <span aria-hidden>🔧</span>
                <span className="text-zinc-400">
                  <b className="font-medium text-zinc-300">Fix:</b> {current.fixNote}
                </span>
              </p>
            )}
          </div>

          {current.tags.length > 0 && (
            <footer className="mt-4 flex flex-wrap gap-2">
              {current.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-zinc-400"
                >
                  #{t}
                </span>
              ))}
            </footer>
          )}
        </>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      {current.status === "unstructured" && (
        <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
          <button
            onClick={retry}
            disabled={busy !== null}
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
          >
            {busy === "retry" ? "Re-structuring…" : "Retry structuring"}
          </button>
          <span className="text-xs text-zinc-600">
            the raw dictation is saved — nothing was lost
          </span>
        </div>
      )}

      {current.status !== "unstructured" && !current.fixNote && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <p className="mb-2 text-xs text-zinc-500">
            Closed the loop? Dictate how you fixed it — the scar closes.
          </p>
          <div className="flex gap-2">
            <input
              value={fixNote}
              onChange={(e) => setFixNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") close();
              }}
              placeholder="e.g. shipped the retry queue, added a test"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
            />
            <button
              onClick={close}
              disabled={busy !== null || !fixNote.trim()}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-40"
            >
              {busy === "close" ? "Closing…" : "Close the scar"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
        <button
          onClick={copy}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
        >
          {copied ? "Copied ✓" : "Copy as markdown"}
        </button>
        {current.status !== "unstructured" && !editing && (
          <button
            onClick={startEdit}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
          >
            Edit
          </button>
        )}
        <details className="text-xs text-zinc-600">
          <summary className="cursor-pointer select-none hover:text-zinc-400">
            raw dictation
          </summary>
          <p className="mt-2 max-w-xl whitespace-pre-wrap italic text-zinc-500">
            “{current.rawTranscript}”
          </p>
        </details>
      </div>
    </article>
  );
}