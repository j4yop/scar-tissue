import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scar Tissue — teach your AI once. It never forgets.",
  description:
    "Voice-captured engineering memory for AI coding agents. Dictate the judgment your agent can't see; it never repeats the mistake.",
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
