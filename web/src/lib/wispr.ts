import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Wispr Flow MCP client — reads the developer's Scratchpad so dictated notes can
 * be imported into scar tissue. Speaks MCP Streamable HTTP (2026-07-28, stateless)
 * directly with fetch; no MCP SDK dependency on this side.
 *
 * Token resolution, in order:
 *   1. WISPR_TOKEN env (what a deployment would use)
 *   2. ~/.mcporter/credentials.json (local dev — populated by `mcporter auth wispr`)
 * The token is never logged or returned to callers outside this module.
 */

const ENDPOINT = "https://api.wisprflow.ai/connect/mcp";
const PROTOCOL_VERSION = "2026-07-28";
const MAX_PAGES = 10;

export class WisprError extends Error {}

export type WisprNote = {
  id: string;
  title: string;
  content: string;
  modified_at?: string;
};

function tokenFromEnv(): string | undefined {
  const t = process.env.WISPR_TOKEN?.trim();
  return t || undefined;
}

function tokenFromMcporterStore(): string | undefined {
  try {
    const p = path.join(os.homedir(), ".mcporter", "credentials.json");
    if (!fs.existsSync(p)) return undefined;
    const store = JSON.parse(fs.readFileSync(p, "utf8")) as {
      entries?: Record<string, unknown>;
    };
    for (const entry of Object.values(store.entries ?? {})) {
      const e = entry as {
        serverUrl?: string;
        tokens?: { access_token?: string };
      };
      if (typeof e?.serverUrl === "string" && e.serverUrl.includes("wisprflow")) {
        const tok = e.tokens?.access_token;
        if (typeof tok === "string" && tok) return tok;
      }
    }
  } catch {
    // fall through — treated as "not configured"
  }
  return undefined;
}

export function resolveWisprToken(): string | undefined {
  return tokenFromEnv() ?? tokenFromMcporterStore();
}

export function wisprConfigured(): boolean {
  return Boolean(resolveWisprToken());
}

/** Pull the JSON-RPC message out of a plain-JSON or SSE-framed response. */
function firstJsonRpc(raw: string): Record<string, unknown> | undefined {
  const s = raw.trim();
  if (s.startsWith("{")) {
    try {
      return JSON.parse(s) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  let msg: Record<string, unknown> | undefined;
  for (const line of raw.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const chunk = line.slice(5).trim();
    if (!chunk) continue;
    try {
      msg = JSON.parse(chunk) as Record<string, unknown>;
    } catch {
      // keep scanning
    }
  }
  return msg;
}

async function rpc(
  token: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    throw new WisprError(
      "Wispr rejected the saved token. Refresh it with `mcporter list wispr`."
    );
  }
  if (!res.ok) {
    throw new WisprError(`Wispr MCP returned HTTP ${res.status}.`);
  }
  return firstJsonRpc(await res.text());
}

async function initialize(token: string): Promise<void> {
  await rpc(token, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "scar-tissue", version: "1.0.0" },
    },
  });
  try {
    await rpc(token, { jsonrpc: "2.0", method: "notifications/initialized" });
  } catch {
    // Servers that retired sessions ignore this; harmless either way.
  }
}

function decodeResult(result: Record<string, unknown>): unknown {
  const content = (result.content as Array<Record<string, unknown>>) ?? [];
  for (const block of content) {
    if (block?.type === "text" && typeof block.text === "string") {
      try {
        return JSON.parse(block.text);
      } catch {
        return block.text;
      }
    }
  }
  return result.structuredContent ?? result;
}

async function callTool(
  token: string,
  name: string,
  args: Record<string, unknown>,
  id = 2
): Promise<unknown> {
  const msg = await rpc(token, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name, arguments: args },
  });
  if (!msg) throw new WisprError("Wispr returned no JSON-RPC message.");
  if (msg.error) {
    const err = msg.error as { message?: string };
    throw new WisprError(err.message ?? "Wispr returned an error.");
  }
  const result = (msg.result as Record<string, unknown>) ?? {};
  if (result.isError) {
    const text = ((result.content as Array<Record<string, unknown>>) ?? [])
      .map((b) => b?.text)
      .join(" ");
    throw new WisprError(`${name} failed: ${text || "no detail given"}`);
  }
  return decodeResult(result);
}

function requireToken(): string {
  const token = resolveWisprToken();
  if (!token) {
    throw new WisprError(
      "Wispr isn't connected here. Connect it with `mcporter list wispr`, or set WISPR_TOKEN."
    );
  }
  return token;
}

/** List Scratchpad notes, newest first (titles + ids; content is fetched per note). */
export async function listScratchpadNotes(query = ""): Promise<WisprNote[]> {
  const token = requireToken();
  await initialize(token);

  const out: WisprNote[] = [];
  let cursor: string | undefined;
  let id = 2;

  for (let page = 0; page < MAX_PAGES; page++) {
    const args: Record<string, unknown> = { query };
    if (cursor) args.cursor = cursor;
    const payload = await callTool(token, "search_scratchpad_notes", args, id++);

    if (Array.isArray(payload)) return [...(payload as WisprNote[]), ...out];
    if (!payload || typeof payload !== "object") return out;

    const p = payload as {
      notes?: WisprNote[];
      has_more?: boolean;
      next_cursor?: string;
      nextCursor?: string;
    };
    out.push(...(p.notes ?? []));
    if (!p.has_more) return out;
    cursor = p.next_cursor ?? p.nextCursor;
    if (!cursor) return out;
  }
  return out;
}

/** Fetch one Scratchpad note in full. */
export async function getScratchpadNote(noteId: string): Promise<WisprNote> {
  const token = requireToken();
  await initialize(token);
  const payload = await callTool(token, "get_scratchpad_note", { note_id: noteId }, 3);
  return payload as WisprNote;
}