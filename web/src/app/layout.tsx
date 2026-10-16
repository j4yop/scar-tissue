import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scar Tissue — teach your AI once. It never forgets.",
  description:
    "Voice-captured engineering memory for AI coding agents. Dictate the judgment your agent can't see; it never repeats the mistake.",
  openGraph: {
    title: "Scar Tissue — teach your AI once. It never forgets.",
    description:
      "Dictate the judgment your AI coding agent can't see. Voice-captured engineering memory, served back to agents over MCP.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Scar Tissue — teach your AI once. It never forgets.",
    description:
      "Voice-captured engineering memory for AI coding agents. #NoHandsChallenge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0b] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
