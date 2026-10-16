import { z } from "zod";

/**
 * The single source of truth for a Lesson (a "scar").
 * Used by: the DB (drizzle column types), the LLM (structured output schema),
 * the MCP server (tool args), and the rules-file export. Nothing can drift.
 */

export const lessonSchema = z.object({
  rule: z
    .string()
    .min(10, "rule too short")
    .max(300)
    .describe(
      "ONE imperative sentence a coding agent can follow. Starts with a verb like 'Never', 'Always', 'Use X instead of Y'. This is the payload agents consume."
    ),
  wrong: z
    .string()
    .max(500)
    .describe("The approach that failed or was rejected, stated concretely"),
  right: z
    .string()
    .max(500)
    .describe("The approach that works, stated concretely"),
  why: z
    .string()
    .max(500)
    .describe("The root cause / mechanism — why the wrong approach fails"),
  tags: z
    .array(z.string().min(2).max(30))
    .max(6)
    .describe("2-5 lowercase short tags: technology or topic keywords, e.g. ['react','memoization']"),
  context: z
    .string()
    .max(200)
    .describe("Short context of where this applies, e.g. project name, area, or 'general'"),
});

export type LessonStructured = z.infer<typeof lessonSchema>;

/** Full DB row: structured part + capture metadata. */
export const lessonRowSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  rule: z.string(),
  wrong: z.string(),
  right: z.string(),
  why: z.string(),
  tags: z.array(z.string()),
  context: z.string(),
  /** open = lesson captured, fix not yet dictated back; closed = loop complete; unstructured = LLM failed, raw kept for retry */
  status: z.enum(["open", "closed", "unstructured"]),
  fixNote: z.string().nullable(),
  rawTranscript: z.string(),
  sourceContext: z.string().nullable(), // pasted error/log snippet
});

export type LessonRow = z.infer<typeof lessonRowSchema>;

export const LESSON_STATUSES = ["open", "closed"] as const;

/** Render a lesson as markdown (used by copy button and the rules export). */
export function lessonToMarkdown(l: LessonRow): string {
  const lines = [
    `- **${l.rule}**`,
    l.wrong ? `  - ❌ Wrong: ${l.wrong}` : null,
    l.right ? `  - ✅ Right: ${l.right}` : null,
    l.why ? `  - Why: ${l.why}` : null,
    l.tags.length ? `  - Tags: ${l.tags.join(", ")}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
