import { db } from "@/db";
import { lessons } from "@/db/schema";
import { lessonRowSchema, type LessonRow } from "@/lib/schema";
import { desc, ilike, or, sql, and, eq } from "drizzle-orm";

/**
 * One place that reads lessons out of the DB — shared by the public JSON API
 * and the MCP server, so agents and the UI can never disagree about memory.
 */

export function toRow(row: typeof lessons.$inferSelect): LessonRow {
  return lessonRowSchema.parse({
    ...row,
    createdAt: row.createdAt,
    tags: row.tags ?? [],
  });
}

export type SearchParams = {
  q?: string;
  tag?: string;
  status?: "open" | "closed";
  limit?: number;
};

export async function searchLessons(params: SearchParams = {}): Promise<LessonRow[]> {
  const { q, tag, status } = params;
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

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

  return rows.map(toRow);
}

export async function getLesson(id: string): Promise<LessonRow | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id));
  return row ? toRow(row) : null;
}