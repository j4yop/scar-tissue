import { NextResponse } from "next/server";
import { listScratchpadNotes, wisprConfigured, WisprError } from "@/lib/wispr";

export const maxDuration = 30;

/**
 * List the developer's Wispr Flow Scratchpad notes (owner-only: requires a Wispr
 * token on this deployment). Titles only — content is fetched per-note on import.
 */
export async function GET() {
  if (!wisprConfigured()) {
    return NextResponse.json({
      configured: false,
      notes: [],
      hint: "Connect Wispr with `mcporter list wispr`, or set WISPR_TOKEN.",
    });
  }

  try {
    const notes = await listScratchpadNotes();
    return NextResponse.json({
      configured: true,
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title || "(untitled)",
        modifiedAt: n.modified_at ?? null,
      })),
    });
  } catch (err) {
    const message =
      err instanceof WisprError ? err.message : "Could not reach Wispr.";
    return NextResponse.json(
      { configured: true, notes: [], error: message },
      { status: 502 }
    );
  }
}