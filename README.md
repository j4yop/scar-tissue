# Scar Tissue

> **Teach your AI once. It never forgets.**
>
> Voice-captured engineering memory for AI coding agents. Dictate the judgment your agent can't see — Scar Tissue turns it into an imperative lesson card and feeds it back to your agents, so they stop repeating mistakes they already watched you fix.

**Built for [No Hands: The Wispr Challenge](https://www.wemakedevs.org/wispr)** (WeMakeDevs × Wispr Flow · 16–30 Oct 2026 · Builders Track) — and for every developer whose coding agent has the memory of a goldfish.

---

## 🔗 Links

| | |
|---|---|
| **Live demo** | **https://scar-tissue-main-ec61.vercel.app** — no sign-in, real capture loop, judge-usable in 60s |
| **MCP server** | **https://scar-tissue-main-ec61.vercel.app/api/mcp** — stateless streamable HTTP, tools: `search_memory`, `get_lesson`, `memory_stats` |
| **Wispr import** | **https://scar-tissue-main-ec61.vercel.app/import** — pulls your Scratchpad over Wispr's MCP (owner-only; connects automatically on your own machine) |
| **Demo video** | _coming — Day 10_ |
| **Hackathon submission** | wemakedevs.org/wispr |

---

## 1. The problem

AI coding agents are amnesiacs. They repeat the same mistakes across sessions — and *you* are the only memory they have.

**What actually happens, every day:**

1. You and your agent lose 40 minutes to a bug. You finally find the root cause: *"oh — we can't memoize that component because the props are mutated upstream."*
2. Two weeks later, a new session confidently does the exact same thing. You lose another 40 minutes. **Nothing was captured. Why? Because writing it up meant stopping to type — and typing it up is exactly the friction you were mid-debugging through.**
3. Multiply by every session, every developer, every team. The most expensive knowledge an engineering org owns — *negative knowledge, the judgment earned by being wrong* — evaporates daily.

**The evidence this is real and widespread:**

- Open `anthropics/claude-code` issues: [#51735 — "Agents repeat identical mistakes across sessions — no cross-session behavioral learning"](https://github.com/anthropics/claude-code/issues/51735) · [#51728 — "Claude repeatedly violates its own persistent instructions"](https://github.com/anthropics/claude-code/issues/51728)
- CLAUDE.md fatigue is a recurring complaint; hand-written rule files rot because nobody maintains them mid-work
- Whole product category exists for this pain — `projectmem`, `never-again`, `BugVault`, `agent-pitbook` — **but every one of them requires the developer to *write* the entry.** That's the adoption killer: memory tools die when capture is expensive.

> **The core insight:** the bottleneck isn't retrieval or storage — memory tools exist. The bottleneck is **capture cost at the moment of learning**. You just spent 40 minutes in flow-state debugging; the *last* thing you'll do is open a form and type it up.
>
> **Voice drops capture cost to ~zero.** Speaking a lesson takes 15 seconds; typing it takes 5 minutes you don't have. That's why this tool runs on voice by design, not as a gimmick — Wispr Flow dictation is the zero-friction intake, and the lesson is the one artifact nobody types but everyone would dictate.

## 2. The questions this project answers

| # | Question | Answer |
|---|---|---|
| Q1 | *Why do AI coding agents keep making the same mistakes?* | Because your judgment (rejected approaches, root causes, tribal rules) lives only in your head and dies at session end. Agent transcripts capture *what happened* — not *why you said no*. |
| Q2 | *Why doesn't anyone capture it?* | Capture friction. Writing a lesson mid-debug costs minutes of momentum; the ROI feels distant. Typing is the tax nobody pays. |
| Q3 | *How do you capture judgment at zero friction?* | Voice. Hold Wispr Flow, say it the way you'd say it to a colleague — messy, mid-thought, complete. Dictation is the intake; the app does the structuring. |
| Q4 | *How does a rambling voice note become something an agent can use?* | An LLM structuring pass converts prose into an **imperative lesson card**: one rule, the wrong approach, the right approach, the why, tags. Agents need constraints, not paragraphs. |
| Q5 | *How does the memory actually reach the agent at the right moment?* | Two channels: (1) an **MCP server** so any agent (Cursor, Claude Code, opencode) can search the memory mid-task; (2) a **generated rules file** (`CLAUDE.md` / `.cursorrules`) that injects the imperatives deterministically. MCP is the wow; the export is the guarantee. |
| Q6 | *Does it actually change agent behavior?* | That's the demo: the same bug, twice. Without memory the agent repeats the mistake. With memory it quotes the lesson card and swerves. |
| Q7 | *Is this just another "voice → ticket" tool?* | No. Ticket tools (Speqify, BugIt, Voice2Bug) file reports *about an app* for *someone else* to fix. Scar Tissue captures *your engineering judgment* for *your own agents* — a memory, not a report. (Full competitive teardown in [`docs/research/RESEARCH-VERDICT.md`](docs/research/RESEARCH-VERDICT.md).) |

## 3. The solution

**Scar Tissue = capture → structure → remember → serve.**

1. **Capture (voice-native).** Mid-flow or right after a fix, hold Wispr Flow and dictate the lesson: what broke, why, what not to do. Two intakes: paste the dictated text (plus an optional error/log snippet) into the app, or — if you dictated into a **Wispr Flow Scratchpad note** — pull it straight in over [Wispr's own MCP server](https://api.wisprflow.ai/connect/mcp); a multi-rule note becomes several lesson cards in one import. ~15 seconds, hands optional, momentum intact.
2. **Structure (the actual product).** One LLM call turns the ramble into a **Lesson Card**:

   ```yaml
   id: ls_0192
   created: 2026-10-18
   rule:     "Never memoize <OrderTable> with useMemo — its props are mutated upstream"
   wrong:    "useMemo on rows array to stop re-renders"
   right:    "Lift the mutation out of the render path; derive rows with useDeferredValue"
   why:      "props mutated in a WebSocket handler made the memo compare stale references"
   tags:     [react, memoization, websocket]
   status:   open → closed (after the fix is dictated back)
   ```

3. **Remember.** A searchable, tag-filtered memory UI — your engineering scar tissue, queryable. Closed-loop: after the fix ships, dictate the fix note; the scar closes.
4. **Serve (two channels).**
   - **MCP server** (streamable HTTP): `search_memory(query, tags)` / `get_lesson(id)` — agents pull relevant scars mid-task.
   - **Rules export**: generates a `CLAUDE.md` / `.cursorrules` block from your cards — deterministic injection, updated on demand.

## 4. Architecture

```
                         ┌────────────────────────────────────────────┐
                         │                 DEVELOPER                  │
                         │   debugging / reviewing / building         │
                         └───────┬────────────────────────┬───────────┘
                                 │ hold key, speak        │ work in agent
                                 ▼                        ▼
                      ┌─────────────────┐      ┌──────────────────────────┐
                      │   Wispr Flow    │      │  Cursor / Claude Code /  │
                      │  (dictation)    │      │       opencode           │
                      └────────┬────────┘      └───────────┬──────────────┘
                               │ dictated text             │ MCP (streamable HTTP)
                               ▼                           ▼
   ┌────────────────────────────────────────────┐   ┌─────────────────────┐
   │              SCAR TISSUE WEB APP            │   │     MCP SERVER      │
   │  (Next.js on Vercel)                        │   │  /api/mcp route     │
   │                                             │   │  search_memory()    │
   │  Capture page ──► LLM structuring ──► Card  │──►│  get_lesson()       │
   │  (paste + log snippet)   (structured out)   │   │  (read: public,     │
   │                                             │   │   write: token)     │
   │  Memory UI (search / tags / closed loop)    │   └─────────────────────┘
   │  Rules export (CLAUDE.md / .cursorrules)    │
   └───────────────────┬─────────────────────────┘
                       │ Drizzle ORM
                       ▼
              ┌─────────────────┐        ┌──────────────┐
              │    Postgres     │        │  LLM API     │
              │  (Neon)         │        │ (structured  │
              └─────────────────┘        │   output)    │
                                         └──────────────┘
```

**Key decisions:**

- **No sign-in for judges** — public demo is read-only with seeded real scars; writes (app + MCP) are bearer-token gated for the owner.
- **Stateless MCP** on Vercel (each POST self-contained) — no SSE session state to babysit on judging day.
- **No pre-baked fallback** — every capture runs the real pipeline against the real DB. If structuring fails, the raw dictation is saved as `unstructured` (nothing is lost) and can be retried; we never fabricate a card.
- **Wispr-native intake** — `/import` reads your **Wispr Flow Scratchpad** over Wispr's own MCP server (`api.wisprflow.ai/connect/mcp`, OAuth-gated), so a note you already dictated becomes lesson cards without retyping. Owner-only: it resolves a real Wispr token locally, and degrades honestly to "not connected" on the public deployment.
- **Determinism over cleverness** — keyword/tag search, not embeddings; the rules-file export guarantees lessons land even if an agent skips the MCP call.

## 5. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Full-stack in one deploy; Vercel-native |
| UI | Tailwind CSS | Speed; the lesson card is the money shot |
| DB | **Neon Postgres + Drizzle ORM** (provisioned via Vercel Marketplace) | Zero-ops, typed schema, free tier |
| LLM | **Gemini (`gemini-3-flash-preview`) via Vercel AI SDK** (structured output / zod) | Reliable schema-constrained extraction |
| MCP | **`mcp-handler` v2** (`@modelcontextprotocol/server` v2) — stateless streamable HTTP, 2026-07-28 spec + 2025 fallback | The 2026-standard way agents consume tools |
| Dictation | **Wispr Flow** (paste + **Scratchpad over Wispr's MCP server**) | The capture layer; the hackathon's thesis |
| Hosting | **Vercel** | Live-link-on-judging-day reliability |
| Language | TypeScript end-to-end | One type system from card schema → MCP tool args |

## 6. Workflow plan

**Hackathon clock:** submissions close **Fri 30 Oct, 11:59 pm IST** — we target **Wed 28 Oct**.

| Phase | Days | Work | Exit criteria |
|---|---|---|---|
| **0. Spec by voice** | Day 1 | Dictate this entire spec into Wispr Flow; register; scaffold | This repo exists; spec dictated |
| **1. Core pipeline** | Days 2–3 | Paste → LLM → lesson card; honest-failure + retry path; real captures only | Card renders from dictated text |
| **2. Memory UI** | Days 4–5 | Search, tags, closed loop, landing page (zero jargon, zero sign-in) | Judge-usable in 60s |
| **3. MCP server** | Day 6 | Stateless `/api/mcp` route; test with MCP Inspector → real Claude Code | Agent queries memory live |
| **4. Rules export** | Day 7 | CLAUDE.md/.cursorrules generator | Lesson lands deterministically |
| **5. Dogfood hard** | Days 8–9 | Every real bug/lesson from this build → dictated card (30+ entries) | Seed data is *real*; usage card grows |
| **6. Demo video** | Day 10 | 2-min video, shot list in `docs/05-roadmap.md` | Swerve looks real, no cuts |
| **7. Submit** | Day 11 | Link + video + Wispr usage card + writeup | Submitted early |
| **8. Buffer** | Day 12 | Anything that slipped | — |

**Dogfooding flywheel (the meta-trick):** every bug hit while building Scar Tissue becomes a dictated scar *in* Scar Tissue. The build log doubles as the seed data, the demo material, and the Wispr-usage evidence.

## 7. Hackathon criteria mapping

| Judging criterion | How Scar Tissue nails it |
|---|---|
| **Real problem in your work** | Documented above from this developer's own workflow (see also `passthru` — measuring what dictation loses on the way to coding agents). Dogfooding makes the evidence undeniable. |
| **Wispr used meaningfully (build AND workflow)** | Build: spec, prompts, commit messages, lessons — all dictated. Workflow: the product's intake *is* Wispr dictation; the tool is unusable without voice. |
| **It works (live link, no sign-in)** | Public demo openable in one click; every capture runs the real LLM→DB pipeline (no canned output); failures degrade honestly to a retryable raw entry. |
| **Clear 2-min demo** | The before/after swerve: agent repeats mistake → agent quotes the lesson and swerves. Pre-recorded, captioned, no live-API roulette. |
| **Bonus: usage + social** | Lesson capture is word-dense by nature; every scar is a #NoHandsChallenge post. |

## 8. Status

- [x] Deep research + competitive verification (2 rounds, 5-advisor council ×2)
- [x] Project blueprint (this repo)
- [x] Register for the challenge + Wispr Flow Pro
- [x] Spec dictated into Wispr Flow
- [x] Day 1: scaffold Next.js app
- [x] Core pipeline: paste → structure → card (live on Vercel)
- [x] Memory UI + landing (search, tag + status filters, close-the-loop fix note, retry)
- [x] MCP server (`/api/mcp` — `search_memory`, `get_lesson`, `memory_stats`; live on prod)
- [x] Wispr-native intake (`/import` — reads Wispr Flow Scratchpad over Wispr's MCP, owner-only)
- [x] Rules-file export (`/api/export/claude-md`, `/api/export/cursorrules` — live) + `/connect` page
- [ ] Dogfood 30+ real scars
- [ ] Demo video
- [ ] Submit

## 9. Progress log

| Date | Update |
|---|---|
| 2026-10-16 | Research verdict finalized after competitive sweep (Speqify/BugIt killed the naive idea; agent-memory gap found). Council round 2: 5/5 proceed. Repo created with full blueprint. |
| 2026-10-16 | Council round 3: passthru (existing project) scored head-to-head vs scar-tissue → **4–1 for scar-tissue**. Passthru not submitted (predates challenge); folded in as prior work + measurement spine. See `docs/research/PASSTHRU-COMPARISON.md`. |
| 2026-10-16 | **Stage 0+1 code complete**: Next.js 16 app in `web/` — shared zod Lesson schema, Drizzle + Neon Postgres (provisioned via Vercel Marketplace), live Gemini structuring pipeline (`web/src/lib/llm.ts`) with retries + honest-failure path (raw dictate saved as `unstructured`, retry endpoint), capture page, memory search page, live rules export (`/api/export/claude-md`, `/api/export/cursorrules`), IP rate-limit. **Pending: real GEMINI_API_KEY** (the one on disk is a placeholder) — then end-to-end live test + Vercel deploy. |
| 2026-10-17 | **Stage 1 live end-to-end on production.** Key auth verified (`AQ.`-format key works via `x-goog-api-key`); model moved to `gemini-3-flash-preview` (`gemini-2.5-flash` is retired for new accounts); AI SDK v4 fix — API key belongs on `createGoogle(...)`, not the per-call model fn. Fixed a production-only failure caused by a quoted key value being pushed to Vercel (normalized `.env.local`, re-added env). Deployed to Vercel (`web/` root); disabled Deployment Protection so the URL is public. **Verified live on prod**: real dictation → structured card (201 in ~5s), search, tag filter, rules export, and the retry loop (`unstructured` → `open`). DB cleaned to 4 real lessons. Prod: https://scar-tissue-main-ec61.vercel.app |
| 2026-10-17 | **Stage 2 — the memory loop closes.** `PATCH /api/lessons/[id]` accepts a dictated fix note (real DB update) and sets `status: closed`; the card gained a close-the-loop input and a "retry structuring" button for `unstructured` captures. Verified on prod: close (200), empty note (422), missing id (404), status filtering. |
| 2026-10-17 | **Stage 3 — MCP server + connect page live.** `mcp-handler` v2 (`@modelcontextprotocol/server` v2, zod 4 — the current 2026-07-28 spec, stateless, with the 2025 streamable-HTTP fallback) serves read-only tools `search_memory`, `get_lesson`, `memory_stats` from the same live DB. Extracted `src/lib/lessons.ts` so the API and MCP share one search implementation. New `/connect` page (MCP URL + config snippets for HTTP/stdio clients + rules-file links). Verified on prod: `initialize`, `tools/list`, `tools/call` all return real data. |
| 2026-10-17 | **Stage 4 — Wispr-native intake.** `src/lib/wispr.ts` speaks Wispr Flow's MCP (Streamable HTTP, 2026-07-28) directly; `/api/wispr/notes` lists your Scratchpad and `/api/wispr/import` fetches a note, splits it into rule-sized segments, runs the live structuring pipeline on each, and inserts every card (with a time budget + honest "skipped" count). New `/import` page. Owner-only: token resolves from `WISPR_TOKEN` or the local `mcporter` store; public deployment shows an honest "not connected" state. Verified locally: 34 Scratchpad notes listed, one note imported → 3 real cards. |

---

*Built by [@j4yop](https://github.com/j4yop) · dictated into existence with [Wispr Flow](https://wisprflow.ai) · #NoHandsChallenge*
