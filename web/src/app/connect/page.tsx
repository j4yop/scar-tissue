"use client";

import { useEffect, useState } from "react";

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

export default function ConnectPage() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const mcpUrl = `${origin}/api/mcp`;

  const httpConfig = `{
  "mcpServers": {
    "scar-tissue": {
      "url": "${mcpUrl}"
    }
  }
}`;

  const stdioConfig = `{
  "mcpServers": {
    "scar-tissue": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <a href="/" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← scar tissue
        </a>
        <a href="/memory" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          browse the memory
        </a>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Connect your agent
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Two channels, same memory. MCP lets an agent pull scars mid-task; the rules
        file injects them deterministically. Both read the same live database.
      </p>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">1 · MCP server</h2>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
            live
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Stateless streamable HTTP. Read-only tools:{" "}
          <code className="font-mono text-xs text-zinc-300">search_memory</code>,{" "}
          <code className="font-mono text-xs text-zinc-300">get_lesson</code>,{" "}
          <code className="font-mono text-xs text-zinc-300">memory_stats</code>. Any
          MCP client (Cursor, Claude Code, opencode) can connect.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-orange-300">
            {mcpUrl || "…"}
          </code>
          {mcpUrl && <CopyButton text={mcpUrl} label="Copy URL" />}
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-zinc-500">
          For clients that speak streamable HTTP
        </p>
        <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-300">
          {httpConfig}
        </pre>
        <div className="mt-2">
          <CopyButton text={httpConfig} label="Copy config" />
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-zinc-500">
          For stdio-only clients (Claude Desktop)
        </p>
        <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-300">
          {stdioConfig}
        </pre>
        <div className="mt-2">
          <CopyButton text={stdioConfig} label="Copy config" />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-zinc-100">2 · Rules file</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Generated from every <b className="text-zinc-300">open</b> lesson at request
          time — drop it in your repo so agents read your rules even without MCP.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/export/claude-md"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
          >
            View CLAUDE.md
          </a>
          <a
            href="/api/export/cursorrules"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
          >
            View .cursorrules
          </a>
        </div>
      </section>

      <p className="mt-8 text-xs text-zinc-600">
        Nothing here is cached or hardcoded — both channels regenerate from the live
        database on every request.
      </p>
    </main>
  );
}