import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Knowledge & Compliance AI Agent",
  description: "AI-powered knowledge retrieval and compliance assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}