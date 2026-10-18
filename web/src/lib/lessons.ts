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

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "how", "do", "does", "did",
  "my", "our", "i", "we", "it", "its", "that", "this", "these", "those",
  "from", "at", "by", "as", "so", "if", "then", "than", "but", "not",
]);

/**
 * Split a natural-language query into searchable terms.
 *
 * Agents ask in phrases ("cache keys tenant id"). Matching the whole phrase
 * with one ILIKE fails unless it appears verbatim, so we match term-by-term
 * and rank the results instead.
 */
function queryTerms(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^a-z0-9_+#.-]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    ),
  ];
}

/**
 * Deterministic relevance: a term hit is worth more in the rule you'll quote
 * than deep in the raw transcript. No embeddings — this is debuggable.
 */
function scoreLesson(l: LessonRow, terms: string[]): number {
  const rule = l.rule.toLowerCase();
  const why = l.why.toLowerCase();
  const sides = `${l.wrong} ${l.right}`.toLowerCase();
  const tags = l.tags.join(" ").toLowerCase();
  const raw = l.rawTranscript.toLowerCase();

  let score = 0;
  for (const t of terms) {
    if (rule.includes(t)) score += 4;
    if (tags.includes(t)) score += 3;
    if (why.includes(t)) score += 2;
    if (sides.includes(t)) score += 1.5;
    if (raw.includes(t)) score += 0.5;
  }
  if (l.status === "closed") score += 0.25; // proven fixes edge out open ones
  return score;
}

export async function searchLessons(params: SearchParams = {}): Promise<LessonRow[]> {
  const { q, tag, status } = params;
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

  const terms = q ? queryTerms(q) : [];

  const filters = [];
  if (q) {
    if (terms.length) {
      // ANY term may match (broad recall) — relevance is ranked below.
      const like = (t: string) => `%${t}%`;
      filters.push(
        or(
          ...terms.flatMap((t) => [
            ilike(lessons.rule, like(t)),
            ilike(lessons.why, like(t)),
            ilike(lessons.wrong, like(t)),
            ilike(lessons.right, like(t)),
            ilike(lessons.rawTranscript, like(t)),
            sql`${lessons.tags}::text ILIKE ${like(t)}`,
          ])
        )
      );
    } else {
      filters.push(ilike(lessons.rule, `%${q}%`));
    }
  }
  if (tag) {
    filters.push(sql`${lessons.tags} @> ${JSON.stringify([tag])}::jsonb`);
  }
  if (status === "open" || status === "closed") {
    filters.push(eq(lessons.status, status));
  }

  // Fetch a candidate set wider than `limit` so ranking has something to rank.
  const rows = await db
    .select()
    .from(lessons)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(lessons.createdAt))
    .limit(terms.length ? 100 : limit);

  const mapped = rows.map(toRow);
  if (terms.length) {
    mapped.sort((a, b) => scoreLesson(b, terms) - scoreLesson(a, terms));
  }
  return mapped.slice(0, limit);
}

export async function getLesson(id: string): Promise<LessonRow | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id));
  return row ? toRow(row) : null;
}