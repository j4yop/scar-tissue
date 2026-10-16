"use client";

import { useCallback, useEffect, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import type { LessonRow } from "@/lib/schema";

type NoteMeta = { id: string; title: string; modifiedAt: string | null };

export default function ImportPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [hint, setHint] = useState<string>("");
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [split, setSplit] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [imported, setImported] = useState<LessonRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [importedFrom, setImportedFrom] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wispr/notes");
      const data = await res.json();
      setConfigured(Boolean(data.configured));
      setNotes(data.notes ?? []);
      setHint(data.hint ?? "");
      if (data.error) setError(data.error);
    } catch {
      setError("Could not load Wispr notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const importNote = async (note: NoteMeta) => {
    setBusyId(note.id);
    setError(null);
    setImported([]);
    setSkipped(0);
    try {
      const res = await fetch("/api/wispr/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id, split }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImported(data.lessons ?? []);
      setSkipped(data.skipped ?? 0);
      setImportedFrom(data.noteTitle ?? note.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <a href="/" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← scar tissue
        </a>
        <div className="flex gap-4">
          <a href="/capture" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            + capture
          </a>
          <a href="/memory" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            memory
          </a>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Import from Wispr Scratchpad
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        You already dictated it into Wispr Flow. Pull it straight in — Scar Tissue
        reads your Scratchpad over Wispr&apos;s MCP server and structures each rule
        into a lesson card. Real pipeline, real account, nothing retyped.
      </p>

      {configured === false && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          <p className="font-medium">Wispr isn&apos;t connected on this deployment.</p>
          <p className="mt-2 text-amber-200/80">
            This import is owner-only — it reads a real Wispr account. On your own
            machine it connects automatically when you run{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
              mcporter list wispr
            </code>
            , or by setting a <code className="font-mono text-xs">WISPR_TOKEN</code>.
            {hint ? ` ${hint}` : ""}
          </p>
          <p className="mt-3 text-amber-200/80">
            Judges can still use{" "}
            <a href="/capture" className="underline underline-offset-4">
              the capture page
            </a>{" "}
            — every capture runs the same live structuring pipeline.
          </p>
        </div>
      )}

      {configured === true && (
        <>
          <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={split}
              onChange={(e) => setSplit(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            one card per line (a Scratchpad note with several rules becomes several
            scars)
          </label>

          <div className="mt-6 space-y-2">
            {loading && <p className="text-sm text-zinc-500">loading your Scratchpad…</p>}
            {!loading && notes.length === 0 && (
              <p className="text-sm text-zinc-500">
                No Scratchpad notes found. Dictate one into Wispr Flow, then reload.
              </p>
            )}
            {notes.map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-200">{n.title}</p>
                  {n.modifiedAt && (
                    <p className="font-mono text-xs text-zinc-600">
                      {new Date(n.modifiedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => importNote(n)}
                  disabled={busyId !== null}
                  className="shrink-0 rounded-lg border border-orange-500/40 bg-orange-600/20 px-3 py-1.5 text-xs text-orange-200 transition hover:bg-orange-600/30 disabled:opacity-40"
                >
                  {busyId === n.id ? "structuring…" : "Import →"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {imported.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-100">
            {imported.length} scar{imported.length === 1 ? "" : "s"} captured from{" "}
            <span className="text-orange-300">{importedFrom}</span>
          </h2>
          {skipped > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              {skipped} segment{skipped === 1 ? "" : "s"} skipped — nothing meaningful
              to structure.
            </p>
          )}
          <div className="mt-5 space-y-5">
            {imported.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
          <a
            href="/memory"
            className="mt-6 inline-block text-sm text-orange-400 underline underline-offset-4"
          >
            see them in the memory →
          </a>
        </section>
      )}
    </main>
  );
}