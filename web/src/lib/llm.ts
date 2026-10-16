import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { lessonSchema, type LessonStructured } from "./schema";

/**
 * Live structuring: dictated ramble (+ optional log context) -> LessonStructured.
 * No hardcoded outputs anywhere. If the model call fails, callers must save the
 * raw transcript with status 'unstructured' and let the user retry — we never
 * fabricate a result.
 */

const MAX_RETRIES = 2;

const SYSTEM = `You convert a developer's dictated debugging notes into a single imperative "lesson card" for AI coding agents.

Rules:
- The developer dictated this with voice (Wispr Flow): expect rambling, self-corrections, mid-sentence changes of mind. Extract the FINAL intent, not every attempt.
- "rule" must be ONE imperative sentence an agent can follow ("Never X", "Always Y", "Use A instead of B").
- "wrong" = the concrete approach that failed or was rejected. "right" = the concrete approach that works. "why" = the mechanism/root cause.
- If the dictation doesn't say something, leave that field as an empty string. NEVER invent facts, APIs, file names or causes that weren't said or implied by the pasted log.
- tags: 2-5 lowercase short keywords (technologies/topics). context: project/area if mentioned, else "general".
- If the text is not about a technical lesson at all (e.g. small talk), set every field to empty string — the caller will reject it.`;

export class StructuringError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}

export function isMeaningfulLesson(l: LessonStructured): boolean {
  return (
    l.rule.trim().length > 0 &&
    l.tags.length > 0 &&
    (l.wrong.trim().length > 0 || l.right.trim().length > 0 || l.why.trim().length > 0)
  );
}

export async function structureLesson(
  transcript: string,
  sourceContext?: string
): Promise<LessonStructured> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = google(process.env.GEMINI_MODEL || "gemini-2.5-flash");
      const { object } = await generateObject({
        model,
        schema: lessonSchema,
        system: SYSTEM,
        prompt: [
          "Dictated notes from the developer:",
          "<dictation>",
          transcript.trim(),
          "</dictation>",
          sourceContext?.trim()
            ? `\nPasted error/log context for grounding:\n<context>\n${sourceContext.trim().slice(0, 4000)}\n</context>`
            : "",
        ].join("\n"),
      });

      if (!isMeaningfulLesson(object)) {
        throw new StructuringError(
          "The dictation didn't contain enough to build a lesson. Try describing: what broke, why, and what to do instead."
        );
      }
      return object;
    } catch (err) {
      // A meaningful-content rejection is deterministic — don't retry it.
      if (err instanceof StructuringError && !/overloaded|rate|500|503|timeout/i.test(String(err.cause ?? err.message))) {
        if (String(err.message).includes("didn't contain enough")) throw err;
      }
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
      }
    }
  }

  throw new StructuringError(
    `Structuring failed after ${MAX_RETRIES + 1} attempts. Your dictation was saved and can be retried — nothing is lost.`,
    lastError
  );
}
