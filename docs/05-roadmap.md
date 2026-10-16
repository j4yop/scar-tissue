# 05 — Roadmap & demo plan

## Build phases (see README §6 for the table)

Phase gates are exit-criteria based, not date-based. Dates are the plan; slips eat the buffer, never the video.

## Dogfooding protocol (Days 8–9, and actually from Day 2)

Every bug/lesson encountered while building Scar Tissue:
1. Fix it as normal.
2. Hold Wispr Flow, dictate: what broke, why, what not to do (~20 seconds).
3. Paste into Scar Tissue → card → tag.
4. Screenshot if it's a good story.

Targets: **30+ real scars**, tag diversity across React/Next/MCP/LLM/deploy. These entries are the seed data, the criterion-1 evidence, and the usage-card growth engine.

## Demo video — 2:00 shot list

| Time | Shot | Notes |
|---|---|---|
| 0:00–0:15 | Live dictate into Wispr Flow | Real judgment mid-flow; show the messy raw text |
| 0:15–0:40 | Paste → lesson card assembles | The ❌/✅/rule animation; copy-as-markdown |
| 0:40–1:20 | **The swerve** (pre-recorded, no cuts) | Clip A: agent repeats the mistake (caption: "2nd session, same wrong fix"). Clip B: agent calls `search_memory`, **quotes the lesson**, swerves. Quote-back is the emotional beat |
| 1:20–1:45 | Memory UI | Search a tag, show real scars with specific stories |
| 1:45–2:00 | Proof + CTA | Wispr Insights usage card, "no sign-in, try it now", link on screen |

Rules: real bug from this build; captions on everything; no live agent runs (pre-record); Wispr visibly load-bearing in the first 15 seconds.

## Submission package
1. Live link (no sign-in, seeded)
2. Demo video ≤ 2:00 (unlisted YouTube)
3. Wispr usage card screenshot (Insights → Your usage)
4. The 4-line problem/user/Wispr writeup (README §submission skeleton)

## Weekly checkpoints
- **Mon 19 Oct**: leaderboard live — verify registration + upload usage card week 1
- **Mon 26 Oct**: week-1 winners — post #NoHandsChallenge update with scar-count growth
- **Wed 28 Oct**: submission submitted (2-day buffer)
- **Fri 6 Nov**: winners announced

## Post-hackathon (not for Oct 30)
- Semantic search, auto-surfacing toast in-editor, team memory (org scar tissue), "voice twin" analytics of your engineering judgment.
