import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Announce Pack — press release & media copy builder",
  description:
    "Turn one announcement brief into a press release, outreach pitch, and social post.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
