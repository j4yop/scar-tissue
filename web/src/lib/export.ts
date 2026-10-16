import { db } from "@/db";
import { lessons } from "@/db/schema";
import { lessonToMarkdown, lessonRowSchema } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Live rules-file export — generated from the database at request time.
 * Never cached, never hardcoded: if the DB is empty, the header says so.
 */

export async function renderRulesFile(format: "claude-md" | "cursorrules") {
  const rows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.status, "open"))
    .orderBy(desc(lessons.createdAt));

  const title =
    format === "claude-md"
      ? "Scar Tissue — hard rules (auto-generated, do not edit by hand)"
      : "Scar Tissue — hard rules";

  const header = `<!-- ${title}
     Source: scar tissue memory · ${rows.length} open lesson${rows.length === 1 ? "" : "s"}
     Regenerate: GET /api/export/claude-md
-->`;

  const body =
    rows.length === 0
      ? "\n(no lessons captured yet — capture scars at /capture and regenerate)\n"
      : `\n${rows.map((r) => lessonToMarkdown(lessonRowSchema.parse(r))).join("\n")}\n`;

  return `${header}${body}`;
}

export async function openLessonCount(): Promise<number> {
  const rows = await db.select().from(lessons).where(eq(lessons.status, "open"));
  return rows.length;
}
