# 03 — Architecture

## System diagram

See README §4. Components: Web App (Next.js/Vercel) · Postgres (Supabase) · LLM (Gemini via AI SDK, zod-structured) · MCP server (`/mcp` route) · Rules export endpoints · Wispr Flow (external capture layer) · Coding agents (Cursor/Claude Code/opencode).

## Data flow

### Capture flow
```
Wispr dictate → paste → POST /api/lessons { transcript, logSnippet? }
  → LLM structured call (zod schema → Lesson minus id/status)
  → INSERT lesson (status: open)
  → response: rendered card (animated) + copy-as-markdown
```

### Serve flow (agent)
```
Agent (Cursor/Claude Code) ── MCP streamable HTTP POST /mcp ──► search_memory(query, tags)
  ──► keyword/tag match over lessons (SQL ILIKE + tag overlap, ranked: rule match > tag > context)
  ──► returns top-k cards (rule, why, right)
Agent consumes constraints before attempting the approach
```

### Serve flow (deterministic)
```
GET /export/claude-md → renders all open cards as:
  ## Scar Tissue — hard rules
  - NEVER <rule> (wrong: <wrong> → do: <right> — because <why>) [tags]
Developer pastes/refreshes block in CLAUDE.md / .cursorrules
```

## Repos & routes

```
app/
  page.tsx                 — landing: what it is + seeded scar wall + "try in a minute"
  /capture                 — paste → structure → card (the money shot)
  /memory                  — search, tags, open/closed
  /export/claude-md        — generated rules block (raw + copy UI)
  /api/lessons             — POST create, GET list/search
  /api/lessons/[id]        — PATCH (close with fixNote)
  /mcp                     — MCP streamable HTTP endpoint (stateless)
lib/
  llm.ts                   — Gemini structured call + DEMO_MODE prebaked fallback
  db.ts / schema.ts        — Drizzle schema
  mcp.ts                   — MCP tool handlers
  search.ts                — keyword/tag ranking
  export.ts                — rules-file renderer
```

## Environment / secrets

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres |
| `GEMINI_API_KEY` | LLM structuring |
| `SCAR_WRITE_TOKEN` | Bearer token for writes (app + MCP add) |
| `DEMO_MODE=1` | Serve pre-baked structuring response (judge-proof) |

## Reliability posture (judging day)

- Every external dependency (LLM API, MCP) has a static fallback or is pre-recorded in the video.
- Public MCP endpoint is **read-only**; no token in any judge-visible surface.
- Seed script idempotent, runs on deploy; demo data verified post-deploy.
- Cold starts: stateless MCP POSTs self-contained (2–3s Vercel cold start acceptable; retry logic documented in agent config).
