import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800","900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promptify — AI Voice Prompt Generator",
  description: "Speak your idea. Get an expert-level AI prompt injected instantly into any app. A floating desktop widget for Windows — inspired by Wispr Flow.",
  keywords: ["AI prompts","voice to text","desktop widget","Windows app","prompt engineering","AI assistant"],
  authors: [{ name: "Promptify" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
