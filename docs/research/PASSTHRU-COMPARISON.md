# Passthru vs Scar Tissue — Council Round 3 (16 Oct 2026)

## What passthru is
An already-shipped dictation-fidelity measurement instrument (built Oct 3–14, 68 commits, deployed at passthru-ebon.vercel.app): 9 dictated captures × 3 Wispr Auto-Cleanup settings = 24 runs. Findings: cleanup is wildly variable (15–41 pt spread), identifier corruption is the top failure mode (5/24 runs, happens even with cleanup off), one prohibition inversion ("no pytest" → "not pytest") that did not reproduce in 8 follow-ups. Python package + 151 tests + mutation testing + static HTML report + live paste-and-compare tool. Built entirely by dictation. Discovered that Wispr Flow has an MCP server exposing Scratchpad/calendar/meetings.

## Scores (5 advisors, 1–10, averaged)

| Axis | passthru | scar-tissue |
|---|---|---|
| Real problem in your work | **8.2** | **8.4** |
| Wispr in build AND workflow | **8.4** | 8.0 |
| Live link (no sign-in, try in a minute) | **8.2** (today) | 6.0 (unbuilt; ~8 projected) |
| ≤2-min demo clarity | 6.6 | **8.0** (projected; high variance) |
| Bonus potential (usage card + social) | 6.2 | **7.4** |
| Risk profile | Rules/eligibility risk (HIGH) | Schedule risk (MEDIUM) |

## Vote: scar-tissue 4, passthru 1

| Advisor | Verdict | Decisive reason |
|---|---|---|
| Contrarian | scar-tissue | Passthru's eligibility is "a disqualification with receipts" — 68 commits predate the challenge's Oct 16 start ("make your first Flow the start of your project"). Submission risk 8/10. |
| First Principles | scar-tissue | The brief's verb is *fixes*. Passthru converts a problem into a dataset; scar-tissue converts it into a behavior change. Also: you could build passthru by typing; scar-tissue *runs on* voice. |
| Expansionist | scar-tissue | Flywheel: passthru is a snapshot (content pipeline done → silence); scar-tissue manufactures daily content, word-count, and demo material as a byproduct of building. Fold passthru in as the measurement spine — strictly dominant. |
| Outsider / Judge-sim | **passthru** (dissent) | It's finished, verifiable, Wispr-drenched ("151 tests by dictation is the story"). Scar-tissue is a judged demo running against a blueprint with 12 days of build risk. |
| Executor | scar-tissue | Passthru predates the challenge → criterion-1 credibility hit judges can see in 30 seconds of commit history. Scar-tissue's risks are schedule-based and fixable; passthru's is rules-based and isn't. Hybrid mandatory. |

## Decisions adopted
1. **Never submit passthru as the entry.** It predates the challenge window (visible commit history) and the hackathon's verb is "fix," not "measure."
2. **Fold passthru into the scar-tissue submission as prior work**: "I built the instrument that measures what dictation loses (passthru, 24 runs, 151 tests); Scar Tissue is the workflow that closes the loop." Converts a liability into credibility and proves you live in this problem space.
3. **Synergy captured**: passthru's discovery that Wispr Flow exposes an MCP server (Scratchpad) becomes scar-tissue's future auto-import path — dictate a lesson into Scratchpad, import without pasting. Post-MVP; documented, not built.
4. **Executor's risk controls adopted into the plan**: dumb-simple Lesson schema on Day 1; minimum shippable fallback if MCP slips (capture → seeded memory → rules export + honest video framing); never show a 500 on judging day.
5. Passthru remains deployed and referenced — it is the fallback artifact and the "built by voice" proof point.
