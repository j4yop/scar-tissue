import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import type { LessonStructured } from "@/lib/schema";

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(), // nanoid-style, generated app-side
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  rule: text("rule").notNull(),
  wrong: text("wrong").notNull().default(""),
  right: text("right").notNull().default(""),
  why: text("why").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  context: text("context").notNull().default("general"),
  // open: awaiting fix; closed: fix dictated back; unstructured: LLM failed, raw kept for retry
  status: text("status").notNull().default("open"),
  fixNote: text("fix_note"),
  rawTranscript: text("raw_transcript").notNull(),
  sourceContext: text("source_context"),
});

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
