export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-orange-500">
        builders track · no hands: the wispr challenge
      </p>
      <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-100">
        Scar Tissue
      </h1>
      <p className="mt-3 text-xl text-zinc-400">
        Teach your AI once. <span className="text-zinc-100">It never forgets.</span>
      </p>
      <p className="mt-6 max-w-xl leading-relaxed text-zinc-500">
        Your coding agent keeps re-making mistakes you already fixed with it —
        because your judgment never got written down. Dictate the lesson with{" "}
        <b className="text-zinc-300">Wispr Flow</b>; Scar Tissue turns the ramble
        into an imperative rule your agents search mid-task.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="/capture"
          className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          Capture a scar →
        </a>
        <a
          href="/memory"
          className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/25 hover:bg-white/5"
        >
          Browse the memory
        </a>
      </div>

      <p className="mt-12 text-xs text-zinc-600">
        no sign-in · nothing hardcoded — every capture runs the live structuring
        pipeline · MCP + rules export coming in Stage 3
      </p>
    </main>
  );
}
