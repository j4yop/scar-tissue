import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { structureLesson } from "@/lib/llm";
import { eq } from "drizzle-orm";

export const maxDuration = 60;

/** Retry structuring for a saved-but-unstructured capture. Real LLM call, no fallbacks. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [row] = await db.select().from(lessons).where(eq(lessons.id, id));
  if (!row) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }
  if (row.status !== "unstructured") {
    return NextResponse.json(
      { error: `Lesson is already ${row.status}.` },
      { status: 409 }
    );
  }

  try {
    const structured = await structureLesson(
      row.rawTranscript,
      row.sourceContext ?? undefined
    );
    const [updated] = await db
      .update(lessons)
      .set({
        rule: structured.rule,
        wrong: structured.wrong,
        right: structured.right,
        why: structured.why,
        tags: structured.tags,
        context: structured.context || "general",
        status: "open",
      })
      .where(eq(lessons.id, id))
      .returning();

    return NextResponse.json({ lesson: updated });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Structuring failed again. The dictation stays saved — try later.",
      },
      { status: 502 }
    );
  }
}
