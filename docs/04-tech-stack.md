# 04 — Tech stack & rationale

| Layer | Choice | Why this and not the alternative |
|---|---|---|
| Framework | Next.js App Router + TypeScript | One deployable unit for UI + API + MCP route; Vercel-native; TS end-to-end means the Lesson schema is typed from DB → LLM output → MCP tool args |
| Styling | Tailwind CSS | Fastest path to a polished card/landing; no design-system tax in a 12-day build |
| DB | Supabase Postgres + Drizzle ORM | Zero-ops, free tier, typed schema, SQL-level keyword search (ILIKE + tag arrays) — no extra search infra |
| LLM | Google Gemini + Vercel AI SDK (`generateObject` + zod) | Schema-constrained structured output for the Lesson card; strong JSON reliability; cheap at this volume |
| MCP | `@modelcontextprotocol/sdk`, streamable HTTP **stateless** | Works on serverless (each POST self-contained, no SSE session); the standard agents already speak |
| Dictation | Wispr Flow (desktop app) | The capture layer; no API exists or needed — dictation pastes as text; also the hackathon's required tool |
| Hosting | Vercel | Live link reliability on judging day; preview deploys for each phase |
| Video | Screen recording + Wispr Flow on-camera | The dictate itself is footage |
| Versioning | Git + GitHub, MIT license | Open-source the MCP from day 1 (discoverability + judge goodwill) |

## Explicit non-choices
- **No embeddings/vector DB** — keyword + tag ranking is deterministic and debuggable; semantic search is a post-hackathon upgrade.
- **No auth system** — public read-only demo + single bearer token for owner writes. Judges must never meet a login screen.
- **No native/desktop app** — a web app gives judges a clickable link; the dictation stays in Wispr Flow where it belongs.
- **No queue/job system** — one LLM call per capture; synchronous is fine at this scale.
