import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { structureLesson, isMeaningfulLesson } from "@/lib/llm";
import { toRow } from "@/lib/lessons";
import { getScratchpadNote, wisprConfigured, WisprError } from "@/lib/wispr";

export const maxDuration = 60;

/** Split a Scratchpad note into candidate one-rule segments. */
function segmentNote(content: string, split: boolean): string[] {
  const text = (content ?? "").trim();
  if (!text) return [];
  if (!split) return text.length >= 40 ? [text] : [];
  return text
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length >= 40)
    .slice(0, 6);
}

/**
 * Import a Scratchpad note into scar tissue: fetch the real note over Wispr's
 * MCP, run the live structuring pipeline per segment, and insert every card.
 * Nothing is faked — if structuring fails for a segment, it's skipped honestly.
 */
export async function POST(req: Request) {
  if (!wisprConfigured()) {
    return NextResponse.json(
      {
        error:
          "Wispr isn't connected on this deployment. Run `mcporter list wispr` locally (or set WISPR_TOKEN).",
      },
      { status: 400 }
    );
  }

  let body: { noteId?: unknown; split?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const noteId = typeof body.noteId === "string" ? body.noteId : "";
  const split = body.split !== false;
  if (!noteId) {
    return NextResponse.json({ error: "noteId is required." }, { status: 400 });
  }

  let note;
  try {
    note = await getScratchpadNote(noteId);
  } catch (err) {
    const message = err instanceof WisprError ? err.message : "Could not read that note from Wispr.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const segments = segmentNote(note.content ?? "", split);
  if (!segments.length) {
    return NextResponse.json(
      { error: "That note has nothing long enough to turn into a lesson." },
      { status: 422 }
    );
  }

  const created = [];
  let skipped = 0;

  // Stay inside the serverless time budget: stop structuring new segments once
  // we approach maxDuration. Remaining segments are reported as skipped.
  const startedAt = Date.now();
  const BUDGET_MS = 45_000;

  for (const segment of segments) {
    if (Date.now() - startedAt > BUDGET_MS) {
      skipped++;
      continue;
    }
    try {
      const structured = await structureLesson(
        segment,
        `Dictated into Wispr Flow Scratchpad. Note title: ${note.title || "(untitled)"}`
      );
      if (!isMeaningfulLesson(structured)) {
        skipped++;
        continue;
      }
      const [row] = await db
        .insert(lessons)
        .values({
          id: `ls_${randomBytes(6).toString("hex")}`,
          rule: structured.rule,
          wrong: structured.wrong,
          right: structured.right,
          why: structured.why,
          tags: structured.tags,
          context: structured.context || "general",
          status: "open",
          rawTranscript: segment,
          sourceContext: `Imported from Wispr Scratchpad — "${note.title || "(untitled)"}"`,
        })
        .returning();
      created.push(toRow(row));
    } catch {
      skipped++;
    }
  }

  if (!created.length) {
    return NextResponse.json(
      { error: "Couldn't structure that note into any lesson. Nothing was saved." },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { lessons: created, skipped, noteTitle: note.title || "(untitled)" },
    { status: 201 }
  );
}