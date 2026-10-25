import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicSense AI — Next-Gen Civic & Sustainability Intelligence",
  description: "Autonomous civic infrastructure and ecological intelligence engine powered by Gemini 1.5 Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background min-h-screen text-slate-100 antialiased selection:bg-civic-emerald selection:text-black`}>
        <div className="fixed inset-0 bg-mesh-grid pointer-events-none z-0 opacity-80" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
