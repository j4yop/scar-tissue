import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const maxDuration = 30;

const patchSchema = z.object({
  /** The closing note: how the scar was fixed / what shipped. Real text only. */
  fixNote: z.string().min(1, "fix note is empty").max(1000),
});

/**
 * Close the loop on a lesson: dictate back the fix, and the scar closes.
 * Real DB update — no simulation.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A fix note is required to close a lesson." },
      { status: 422 }
    );
  }

  const [row] = await db.select().from(lessons).where(eq(lessons.id, id));
  if (!row) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }
  if (row.status === "unstructured") {
    return NextResponse.json(
      { error: "This capture isn't structured yet — retry it first." },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(lessons)
    .set({ fixNote: parsed.data.fixNote, status: "closed" })
    .where(eq(lessons.id, id))
    .returning();

  return NextResponse.json({ lesson: updated });
}