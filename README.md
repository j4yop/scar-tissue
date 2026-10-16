# Scar Tissue

> **Teach your AI once. It never forgets.**
>
> Voice-captured engineering memory for AI coding agents. Dictate the judgment your agent can't see — Scar Tissue turns it into an imperative lesson card and feeds it back to your agents, so they stop repeating mistakes they already watched you fix.

**Built for [No Hands: The Wispr Challenge](https://www.wemakedevs.org/wispr)** (WeMakeDevs × Wispr Flow · 16–30 Oct 2026 · Builders Track) — and for every developer whose coding agent has the memory of a goldfish.

---

## 🔗 Links

| | |
|---|---|
| **Live demo** | _coming — Day 3_ (no sign-in, seeded with real scars, judge-usable in 60 seconds) |
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

1. **Capture (voice-native).** Mid-flow or right after a fix, hold Wispr Flow and dictate the lesson: what broke, why, what not to do. Paste the dictated text (plus an optional error/log snippet) into the app. ~15 seconds, hands optional, momentum intact.
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
   │  (Next.js on Vercel)                        │   │  /mcp route         │
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
              │  (Supabase)     │        │ (structured  │
              └─────────────────┘        │   output)    │
                                         └──────────────┘
```

**Key decisions:**

- **No sign-in for judges** — public demo is read-only with seeded real scars; writes (app + MCP) are bearer-token gated for the owner.
- **Stateless MCP** on Vercel (each POST self-contained) — no SSE session state to babysit on judging day.
- **`DEMO_MODE` from day 1** — a pre-baked structuring response behind a flag so the live generation demo can't die on an API outage.
- **Determinism over cleverness** — keyword/tag search, not embeddings; the rules-file export guarantees lessons land even if an agent skips the MCP call.

## 5. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Full-stack in one deploy; Vercel-native |
| UI | Tailwind CSS | Speed; the lesson card is the money shot |
| DB | **Supabase Postgres + Drizzle ORM** | Zero-ops, typed schema, free tier |
| LLM | **Gemini via Vercel AI SDK** (structured output / zod) | Reliable schema-constrained extraction |
| MCP | **`@modelcontextprotocol/sdk`** — streamable HTTP, stateless route | The 2026-standard way agents consume tools |
| Dictation | **Wispr Flow** | The capture layer; the hackathon's thesis |
| Hosting | **Vercel** | Live-link-on-judging-day reliability |
| Language | TypeScript end-to-end | One type system from card schema → MCP tool args |

## 6. Workflow plan

**Hackathon clock:** submissions close **Fri 30 Oct, 11:59 pm IST** — we target **Wed 28 Oct**.

| Phase | Days | Work | Exit criteria |
|---|---|---|---|
| **0. Spec by voice** | Day 1 | Dictate this entire spec into Wispr Flow; register; scaffold | This repo exists; spec dictated |
| **1. Core pipeline** | Days 2–3 | Paste → LLM → lesson card; `DEMO_MODE` fallback; seed script | Card renders from dictated text |
| **2. Memory UI** | Days 4–5 | Search, tags, closed loop, landing page (zero jargon, zero sign-in) | Judge-usable in 60s |
| **3. MCP server** | Day 6 | Stateless `/mcp` route; test with MCP Inspector → real Claude Code | Agent queries memory live |
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
| **It works (live link, no sign-in)** | Read-only seeded demo, openable in one click, `DEMO_MODE` fallback for every external dependency. |
| **Clear 2-min demo** | The before/after swerve: agent repeats mistake → agent quotes the lesson and swerves. Pre-recorded, captioned, no live-API roulette. |
| **Bonus: usage + social** | Lesson capture is word-dense by nature; every scar is a #NoHandsChallenge post. |

## 8. Status

- [x] Deep research + competitive verification (2 rounds, 5-advisor council ×2)
- [x] Project blueprint (this repo)
- [x] Register for the challenge + Wispr Flow Pro
- [x] Spec dictated into Wispr Flow
- [ ] Day 1: scaffold Next.js app
- [ ] Core pipeline: paste → structure → card
- [ ] Memory UI + landing
- [ ] MCP server (`/mcp`)
- [ ] Rules-file export
- [ ] Dogfood 30+ real scars
- [ ] Demo video
- [ ] Submit

## 9. Progress log

| Date | Update |
|---|---|
| 2026-10-16 | Research verdict finalized after competitive sweep (Speqify/BugIt killed the naive idea; agent-memory gap found). Council round 2: 5/5 proceed. Repo created with full blueprint. |
| 2026-10-16 | Council round 3: passthru (existing project) scored head-to-head vs scar-tissue → **4–1 for scar-tissue**. Passthru not submitted (predates challenge); folded in as prior work + measurement spine. See `docs/research/PASSTHRU-COMPARISON.md`. |
| 2026-10-16 | **Stage 0+1 code complete**: Next.js 16 app in `web/` — shared zod Lesson schema, Drizzle + Neon Postgres (provisioned via Vercel Marketplace), live Gemini structuring pipeline (`web/src/lib/llm.ts`) with retries + honest-failure path (raw dictate saved as `unstructured`, retry endpoint), capture page, memory search page, live rules export (`/api/export/claude-md`, `/api/export/cursorrules`), IP rate-limit. **Pending: real GEMINI_API_KEY** (the one on disk is a placeholder) — then end-to-end live test + Vercel deploy. |

---

*Built by [@j4yop](https://github.com/j4yop) · dictated into existence with [Wispr Flow](https://wisprflow.ai) · #NoHandsChallenge*
