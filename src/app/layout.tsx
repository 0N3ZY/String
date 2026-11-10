import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "String — A little better, together.",
  description: "A space to share ideas, ask questions, and hang out.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}