import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axiom Finance - AI-Powered Financial Intelligence",
  description: "Personal AI-powered financial planning and DeFAI trading agents. Manage budgets, analyze spending, and automate DeFi trading strategies.",
  keywords: ["Axiom Finance", "AI Finance", "Personal Finance", "DeFAI", "DeFi Trading", "Budget Planning", "Financial AI"],
  authors: [{ name: "Axiom Finance Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Axiom Finance",
    description: "AI-Powered Financial Intelligence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Finance",
    description: "AI-Powered Financial Intelligence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
