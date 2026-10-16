import { renderRulesFile } from "@/lib/export";

export const maxDuration = 30;

export async function GET() {
  const body = await renderRulesFile("claude-md");
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
