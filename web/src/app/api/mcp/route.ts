import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchLessons, getLesson } from "@/lib/lessons";
import type { LessonRow } from "@/lib/schema";

export const maxDuration = 60;

/** Render a lesson as plain text for the agent to quote back. */
function renderLesson(l: LessonRow, index?: number): string {
  const head = `${index !== undefined ? `${index + 1}. ` : ""}${l.rule}  [${l.id}]`;
  const body = [
    l.wrong ? `   ❌ Wrong: ${l.wrong}` : null,
    l.right ? `   ✅ Right: ${l.right}` : null,
    l.why ? `   Why: ${l.why}` : null,
    l.tags.length ? `   Tags: ${l.tags.join(", ")}` : null,
    l.fixNote ? `   Fixed: ${l.fixNote}` : null,
    `   Status: ${l.status}`,
  ].filter(Boolean);
  return [head, ...body].join("\n");
}

/**
 * Scar Tissue MCP server — stateless streamable HTTP (2026-07-28 spec) with a
 * 2025-era fallback, served by mcp-handler v2. Read-only: agents pull memory,
 * they don't write it.
 */
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_memory",
      {
        title: "Search scar tissue",
        description:
          "Search the developer's engineering memory ('scar tissue'): imperative lessons learned from real bugs and rejected approaches. Call this BEFORE proposing a fix for a non-trivial bug, before introducing a dependency or pattern, and whenever a task resembles earlier work. Returns lesson cards (rule / wrong / right / why). Quote the matching rule in your answer.",
        inputSchema: z.object({
          query: z
            .string()
            .optional()
            .describe(
              "Keywords: technology, symptom, or concept, e.g. 'stripe webhook retry'. Multi-word is fine — terms are matched individually and ranked."
            ),
          tags: z
            .array(z.string())
            .optional()
            .describe(
              "Filter to lessons carrying ALL of these tags, e.g. ['react','memoization']"
            ),
          status: z
            .enum(["open", "closed"])
            .optional()
            .describe("open = fix not yet dictated back; closed = loop complete"),
          limit: z.number().int().min(1).max(50).optional(),
        }),
      },
      async ({ query, tags, status, limit }) => {
        let rows = await searchLessons({ q: query, status, limit: 100 });
        if (tags?.length) {
          rows = rows.filter((r) => tags.every((t) => r.tags.includes(t)));
        }
        rows = rows.slice(0, limit ?? 10);

        if (!rows.length) {
          return {
            content: [
              {
                type: "text" as const,
                text: "No scars matched those keywords. Try fewer or broader terms (e.g. 'cache tenant', 'webhook retry'). Nothing has been recorded on this topic yet — proceed from first principles.",
              },
            ],
          };
        }

        const text = [
          `${rows.length} scar(s) from the developer's memory:`,
          "",
          ...rows.map((l, i) => renderLesson(l, i)),
        ].join("\n\n");

        return { content: [{ type: "text" as const, text }] };
      }
    );

    server.registerTool(
      "get_lesson",
      {
        title: "Get one scar by id",
        description: "Fetch a single lesson card by its id, e.g. ls_05c73a4d8d5c.",
        inputSchema: z.object({ id: z.string().describe("Lesson id, e.g. ls_05c73a4d8d5c") }),
      },
      async ({ id }) => {
        const lesson = await getLesson(id);
        return {
          content: [
            {
              type: "text" as const,
              text: lesson
                ? renderLesson(lesson)
                : `No lesson with id ${id}.`,
            },
          ],
        };
      }
    );

    server.registerTool(
      "memory_stats",
      {
        title: "Memory overview",
        description:
          "How many scars have been captured (open vs closed) and the most common tags. Call this at the start of a session to see what this developer already knows.",
        inputSchema: z.object({}),
      },
      async () => {
        const rows = await searchLessons({ limit: 100 });
        const open = rows.filter((r) => r.status === "open").length;
        const closed = rows.filter((r) => r.status === "closed").length;
        const counts = new Map<string, number>();
        for (const r of rows) {
          for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        const top = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([t, c]) => `${t} (${c})`)
          .join(", ");

        return {
          content: [
            {
              type: "text" as const,
              text: `Scar tissue: ${rows.length} lessons captured (${open} open, ${closed} closed). Top tags: ${top || "none yet"}.`,
            },
          ],
        };
      }
    );
  },
  { serverInfo: { name: "scar-tissue", version: "1.0.0" } }
);

export { handler as GET, handler as POST, handler as DELETE };