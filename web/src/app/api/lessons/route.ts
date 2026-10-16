import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { structureLesson, StructuringError, isMeaningfulLesson } from "@/lib/llm";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { lessonRowSchema, type LessonRow } from "@/lib/schema";
import { desc, ilike, or, sql, and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export const maxDuration = 60;

function toRow(row: typeof lessons.$inferSelect): LessonRow {
  return lessonRowSchema.parse({
    ...row,
    createdAt: row.createdAt,
    tags: row.tags ?? [],
  });
}

const newId = () => `ls_${randomBytes(6).toString("hex")}`;

export async function POST(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many captures. Try again in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let body: { transcript?: unknown; sourceContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  const sourceContext =
    typeof body.sourceContext === "string" ? body.sourceContext.trim().slice(0, 4000) : "";

  if (transcript.length < 40) {
    return NextResponse.json(
      { error: "Dictation too short — describe what broke, why, and what to do instead (at least a sentence or two)." },
      { status: 400 }
    );
  }
  if (transcript.length > 8000) {
    return NextResponse.json({ error: "Dictation too long (max 8000 chars)." }, { status: 400 });
  }

  const id = newId();

  try {
    const structured = await structureLesson(transcript, sourceContext || undefined);
    const [row] = await db
      .insert(lessons)
      .values({
        id,
        rule: structured.rule,
        wrong: structured.wrong,
        right: structured.right,
        why: structured.why,
        tags: structured.tags,
        context: structured.context || "general",
        status: "open",
        rawTranscript: transcript,
        sourceContext: sourceContext || null,
      })
      .returning();
    return NextResponse.json({ lesson: toRow(row) }, { status: 201 });
  } catch (err) {
    // Never fabricate a result. Save the raw dictate honestly, flag for retry.
    const isStructuringFailure = err instanceof StructuringError;
    if (!isStructuringFailure) {
      console.error("unexpected capture error", err);
    }
    try {
      const [row] = await db
        .insert(lessons)
        .values({
          id,
          rule: "",
          wrong: "",
          right: "",
          why: "",
          tags: [],
          context: "general",
          status: "unstructured",
          rawTranscript: transcript,
          sourceContext: sourceContext || null,
        })
        .returning();
      return NextResponse.json(
        {
          error:
            err instanceof StructuringError
              ? err.message
              : "Structuring failed unexpectedly. Your dictation was saved for retry.",
          lesson: toRow(row),
        },
        { status: 422 }
      );
    } catch (dbErr) {
      console.error("could not even save raw", dbErr);
      return NextResponse.json(
        { error: "Structuring failed and the capture could not be saved. Try again." },
        { status: 503 }
      );
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const tag = url.searchParams.get("tag")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

  const filters = [];
  if (q) {
    filters.push(
      or(
        ilike(lessons.rule, `%${q}%`),
        ilike(lessons.why, `%${q}%`),
        ilike(lessons.wrong, `%${q}%`),
        ilike(lessons.right, `%${q}%`),
        ilike(lessons.rawTranscript, `%${q}%`)
      )
    );
  }
  if (tag) {
    filters.push(sql`${lessons.tags} @> ${JSON.stringify([tag])}::jsonb`);
  }
  if (status === "open" || status === "closed") {
    filters.push(eq(lessons.status, status));
  }

  const rows = await db
    .select()
    .from(lessons)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(lessons.createdAt))
    .limit(limit);

  return NextResponse.json({ lessons: rows.map(toRow) });
}
