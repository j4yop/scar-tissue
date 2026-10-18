import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const maxDuration = 30;

const patchSchema = z
  .object({
    /** The closing note: how the scar was fixed / what shipped. Real text only. */
    fixNote: z.string().min(1, "fix note is empty").max(1000).optional(),
    /** Field-level corrections — fix a card the structuring pass got wrong. */
    rule: z.string().min(5).max(300).optional(),
    wrong: z.string().max(500).optional(),
    right: z.string().max(500).optional(),
    why: z.string().max(500).optional(),
    tags: z.array(z.string().min(1).max(30)).max(6).optional(),
    context: z.string().max(200).optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "nothing to update",
  });

/**
 * Update a lesson: either close the loop (fixNote) or correct the structured
 * fields by hand. Real DB update — no simulation.
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
      { error: "Nothing valid to update." },
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

  const { fixNote, ...fields } = parsed.data;
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) updates[key] = value;
  }
  if (fixNote !== undefined) {
    updates.fixNote = fixNote;
    updates.status = "closed";
  }

  const [updated] = await db
    .update(lessons)
    .set(updates)
    .where(eq(lessons.id, id))
    .returning();

  return NextResponse.json({ lesson: updated });
}