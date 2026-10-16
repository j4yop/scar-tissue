# 06 — Dogfooding log (real scars)

> Target: **30+ real scars.** Every entry is a bug/lesson actually hit while building Scar Tissue (or in the developer's own work), dictated into Wispr Flow and run through the live pipeline. This is the criterion-1 evidence, the demo material, and the Wispr usage-card growth engine — all at once.

## Protocol

1. Hit a bug / make a judgment call.
2. Hold **Wispr Flow** and dictate (~20s): *what broke · why · what to do instead.*
3. Capture it — paste on `/capture`, or dictate a bulleted **Scratchpad note** and import the whole note on `/import`.
4. Tag + (later) close the loop with the fix note.

## Fastest path (bulk)

Dictate **one Scratchpad note** in Wispr Flow with one rule per line — the importer splits it into one card per line:

```
Never push env values to Vercel with the surrounding quotes still on them — it silently stores an invalid value.
Remember that gemini-2.5-flash is retired for new accounts; pin gemini-3-flash-preview or a *-latest alias.
The AI SDK v4 needs the Google key on createGoogle(), not passed per model call.
...
```

Then `/import` → pick the note → one card per line.

## Candidate scars from building Scar Tissue (all real — dictate in your own words)

These are bugs we actually hit and fixed in this repo. Dictate the ones that ring true; correct anything that isn't.

| # | Lesson (to dictate) | Evidence |
|---|---|---|
| 1 | Never wrap env values in quotes when pushing to Vercel — the quotes go in verbatim and the value is silently invalid (our Gemini key failed auth in prod until I normalized `.env.local`). | invalid-key 422 on prod → fixed |
| 2 | `gemini-2.5-flash` is retired for new Google accounts — pin `gemini-3-flash-preview` or a `*-latest` alias. | 404 "no longer available to new users" |
| 3 | The AI SDK v4 needs the API key on `createGoogle()`, not passed to the per-call model function. | `AI_LoadAPIKeyError` while key was set |
| 4 | Next.js 16 with `cacheComponents` rejects `export const dynamic`/`runtime` in route handlers — remove them instead of fighting the build. | build error |
| 5 | `AQ.`-format Google keys authenticate via `x-goog-api-key`, never `Authorization: Bearer`. | 401 on bearer, 404 (auth OK) on header |
| 6 | pnpm v12 blocks dependency build scripts — allow them in `pnpm-workspace.yaml` or the Vercel build dies with `ERR_PNPM_IGNORED_BUILDS`. | failed prod builds |
| 7 | Never pipe a dev server through `head` — when `head` exits the pipe breaks and SIGPIPE kills the server (our dev server "died" for no visible reason). | server exited silently |
| 8 | Vercel Deployment Protection is ON by default — judges hit an SSO wall unless you disable `ssoProtection`. | 302 to sso-api |
| 9 | Never treat a Scratchpad *search* as a full note — it returns an excerpt, so fetch `get_scratchpad_note` for the body (bulk import read empty content until we did). | empty content from search |
| 10 | Namespace every cache key with tenant id + a version prefix — a bare key leaks one tenant's data to another. | (general scar) |
| 11 | `mcporter` Wispr tokens expire in 7 days — refresh with `mcporter list wispr` before an import session, or reads 401. | expired token in store |
| 12 | When a marketplace integration "connects" a DB, verify the env actually landed — ours connected to the wrong project and `DATABASE_URL` was absent until reconnected. | `vercel env pull` had no `DATABASE_URL` |

## Entries captured

| Date | Count | Notes |
|---|---|---|
| 2026-10-17 | 3 imported + 5 captured | Seed from build session + Scratchpad import. Replace/augment with fresh dictation as we dogfood. |

*(This table grows as we dictate. Aim for 30+ before the demo video.)*