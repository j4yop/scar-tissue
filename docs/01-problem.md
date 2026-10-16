# 01 — Problem Statement (deep dive)

## The failing loop

```
bug found ──► root cause understood ──► insight lives in your head
     ▲                                         │
     │                                         ▼  (nothing captured: typing = momentum death)
     └──────── same bug, new session ◄──────────┘
```

## Why existing solutions fail

| Approach | Why it loses the insight |
|---|---|
| **Nothing** (the default) | Insights live in working memory; gone by next session |
| **CLAUDE.md / .cursorrules** | Hand-maintained rule files rot — nobody stops mid-debug to edit them |
| **Agent transcripts** | Capture *what happened*, not *why you rejected an approach*; and nobody post-processes 4-hour transcripts |
| **Memory tools (projectmem, never-again, BugVault…)** | Right storage, wrong intake: all require *typing* the entry — the tax nobody pays mid-debug |
| **Voice→ticket tools (Speqify, BugIt…)** | File reports *about an app* for *someone else* — QA workflow, not self-memory |

## The person who feels this pain

Developers who build with AI coding agents daily (Cursor, Claude Code, opencode, Codex). The pain peaks at the moment of insight — mid-debug, mid-review — when switching to typing costs the most momentum.

## The insight that makes it solvable now

Two technologies crossed in 2026:
1. **Voice capture got good** — Wispr Flow turns rambling speech into clean text at ~220 wpm, in any app, zero friction.
2. **Agents got a tool standard** — MCP lets any coding agent pull context from external memory mid-task.

The unsolved piece is the bridge: **structurally converting spoken judgment into agent-consumable constraints.** That's this project.
