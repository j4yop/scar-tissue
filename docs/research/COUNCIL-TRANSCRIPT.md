# Council Transcript — Wispr "No Hands" Hackathon Project Selection
*16 Oct 2026 · Advisors: Contrarian, First Principles, Expansionist, Outsider, Executor · Full responses delivered in-session; synthesis below. Visual report: `council-report-20261016.html`*

## Research Dossier (condensed)
- **Event**: "No Hands: The Wispr Challenge" — WeMakeDevs × Wispr Flow, 16–30 Oct 2026, online, solo.
- **Tracks**: 1) Builders (developers — working software product solving a problem in your own work, dictated into AI coding tools); 2) No-Code (AI app builders). Pick exactly one.
- **Judging (4 weighted criteria)**: real problem in your work; Wispr used meaningfully (part of build AND workflow); it works (live link, openable and usable by judges without payment/sign-in); demo clarity (≤2-min video).
- **Submission**: project link + ≤2-min video + Wispr usage card (Insights screenshot) + few lines on problem/user/Wispr use. Closes Fri 30 Oct 11:59 pm IST. Winners Fri 6 Nov.
- **Bonus prizes**: Most Wispr usage (words dictated, weekly card uploads) · Social build-in-public (#NoHandsChallenge, tag WeMakeDevs + Wispr Flow).
- **Sample submission** (bar to beat): "Call to Follow-up" (No-Code, Sales) — opens without sign-in, sample notes on first screen, judge tries in a minute, video shows real usage.
- **Prior Wispr-hackathon winners**: HackMIT — user-journey-mapping browser extension (neo4j+RAG); smart-glasses conversation copilot. VoiceOS Tokyo voice-only hackathon — recursive MCP builder that mined dictation history to auto-generate integrations (voice as execution layer, not dictation). Contra challenge comment: "the product doesn't matter… make a good video."
- **Sponsor**: Wispr raised $81M on the "Voice OS" thesis; Flow = voice→polished text in any app (220 wpm, vocabulary learning, snippets); just launched Notetaker.
- **Developer profile**: solo full-stack engineer, 4–6 h/day, full-stack web stack.
- **GitHub landscape**: dictation itself is a saturated commodity (10+ open-source Wispr Flow alternatives) — building a dictation tool is not a winning idea.

## Question put to Council
Which single candidate maximizes winning probability: A Voice Devlog, B Voice Bug Capture, C Voice Code Review, D Voice Decision Log, E Voice Incident Log, or F (a stronger variant)?

## Votes
- Contrarian: **B** (amputate screen-capture; seeded public KB viewer)
- First Principles: **B** (only voice-native candidate; A competes with sponsor's Notetaker)
- Expansionist: **B** (self-feeding flywheel; rides Voice OS narrative)
- Outsider: **A** (best 60-second judge test; B risks auth-wall + demo focus split)
- Executor: **B** (best mock-mode readiness; gave day-by-day estimates + video script)

## Chairman Synthesis
**Consensus**: B wins 4–5. Voice-native > voice-washed. Dogfooding flywheel drives all three bonus/side metrics. E/D/C eliminated unanimously on criterion-1 fit, judge boredom, and parsing fragility respectively.
**Contested**: Outsider's 60-second-feel argument for A. Resolved by adopting A's presentation discipline into B: pre-seeded demo, zero sign-in, artifact on first screen.
**Blind spots caught**: GitHub OAuth trap (core demo client-side; PAT paste optional); macOS permission walls (no screen OCR in v1); demo-video weight (prior winner's insight).
**Verdict**: Build **Voice Bug Capture** — "the rubber duck that files the ticket." Follow WIN-PLAN.md.

---

# ROUND 2 — Re-deliberation after competitive research (16 Oct, later same day)

## New dossier evidence
- "Voice → ticket" is **commoditized**: Speqify (free OSS: element capture + voice → Jira/GitHub/Linear/GitLab), BugIt ($59.99, sentence → full QA bug report with dedup/severity/redaction), Voice2Bug, HyperVoice, MarkupR (OSS), cowork-bug-reporter, voice-to-issue. Judges can google it in 5 seconds.
- Agent-memory via MCP is **early, tiny, and voice-less**: projectmem (MCP native, local, most complete), never-again (0⭐), fix-memory-mcp (0⭐), BugVault (2⭐), agent-pitbook (1⭐). All require *writing* the memory entry — the exact friction that kills memory tools.
- Pain is **documented**: anthropics/claude-code issues #51735 ("Agents repeat identical mistakes across sessions"), #51728 ("Claude repeatedly violates its own persistent instructions"); blogs on agents repeating mistakes; CLAUDE.md fatigue.
- Wispr has no public API — dictation lands as pasted text (fine, honest integration).

## Votes (Round 2)
- Contrarian: **Scar Tissue** — with 3 named traps: demo must prove *behavior change* not connection; moat is the voice capture (lead with it, don't bury under MCP engineering); use post-fix capture ("dictate the why") as the realistic moment.
- First Principles: **proceed-with-changes** — capture friction is the real bottleneck; lesson cards must be imperative rules not prose; **two delivery channels required** (MCP for wow + CLAUDE.md/.cursorrules export for deterministic injection); honest framing: "judgment was never captured because typing it was too expensive."
- Expansionist: **proceed** — only candidate with a compounding flywheel; organizational memory is the post-hackathon market; retweet post: "I dictated every mistake my coding agent made for 2 weeks, then fed them back to it. It stopped making them."; open-source the MCP day 1.
- Outsider/Judge-sim: **top-3, conditional** — never say "MCP" to judges, say "your coding agent finally remembers"; the quote-back moment is the emotional beat; judge one-liners captured (educator/COO/CMO/Wispr-growth).
- Executor: **build, cut extras** — day plan fits 60h if MCP is stateless on Vercel, DEMO_MODE from D1, all agent shots pre-recorded; exact shot list provided.

## Chairman Synthesis (Round 2)
**Verdict: proceed on the REFINED idea — "Scar Tissue" (5/5).** The original "voice bug reporter" is dead (commoditized). The refined product — voice-captured engineering memory for AI coding agents, delivered via MCP + deterministic rules export — is verified unique (no voice+memory+MCP product exists), pain-documented, and sponsor-thesis-aligned. Mandated changes all adopted into WIN-PLAN.md v2: two delivery channels, pre-recorded brutal before/after swerve, no MCP jargon on landing page, imperative lesson cards, post-fix capture emphasis, real dogfooded seed data, scope cuts (no digest/team/embeddings).
