# 02 — Solution spec

## Product: Scar Tissue

Capture → Structure → Remember → Serve.

### Capture
- Paste box for dictated Wispr Flow text (the integration: Flow has no API — dictation lands as text anywhere).
- Optional second box: error message / stack trace / log snippet for grounding.
- Optional screenshot attach (v1.1 if time allows).
- Capture moments: mid-debug ("don't do X, it breaks because Y") **and** post-fix ("the actual root cause was Z") — the post-fix dictation is the most natural habit.

### Lesson Card (the structured artifact)

```ts
type Lesson = {
  id: string;              // ls_xxxx
  createdAt: string;       // ISO
  rule: string;            // ONE imperative sentence — the payload agents consume
  wrong: string;           // the approach that failed
  right: string;           // the approach that works
  why: string;             // root cause / mechanism
  tags: string[];          // ['react', 'memoization']
  context: string;         // project / area, free text
  status: 'open' | 'closed';
  fixNote?: string;        // dictated after the fix; closes the loop
  rawTranscript: string;   // the original dictate (audit trail)
};
```

Design rule: **the card must be imperative, not narrative.** Agents consume constraints ("never X because Y"), not stories. The structuring LLM pass enforces this with schema-constrained output (zod).

### Remember (Memory UI)
- Search (keyword + tag filter), sorted by recency/relevance.
- Open vs closed scars; closed scars show the fix note.
- First screen pre-seeded with **real** scars from dogfooding — no sign-in, judge-usable in 60 seconds.

### Serve (two channels — never bet on one)
1. **MCP server** at `/mcp` (streamable HTTP, stateless):
   - `search_memory({ query, tags?, limit? })` — returns matching lesson cards
   - `get_lesson({ id })` — full card
   - `add_lesson({...})` — token-gated (owner only)
2. **Rules export** at `/export/claude-md` and `/export/cursorrules`:
   - Generates an updated rules block from all cards (grouped by tag), copy button + raw endpoint.
   - Deterministic injection path — guarantees lessons reach the agent even when it skips MCP calls.

### Non-goals (v1)
- No embeddings/semantic search (keyword is enough; deterministic > clever)
- No team/shared workspaces (post-hackathon story)
- No screen OCR, no OS-level permissions, no auto transcript ingestion
- No digest emails
