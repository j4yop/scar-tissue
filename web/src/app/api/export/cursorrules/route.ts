import { renderRulesFile } from "@/lib/export";

export const maxDuration = 30;

export async function GET() {
  const body = await renderRulesFile("cursorrules");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
