import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Consolidated AI Voice Assistant - Webhook Orchestration",
  description: "Advanced webhook orchestration system for the Consolidated AI Voice Assistant empire with BlackBox AI integration and Gemini API support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <nav className="border-b border-purple-500/20 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">⚫</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Consolidated AI Voice Assistant
                  </h1>
                </div>
                <div className="flex items-center space-x-4 text-sm text-purple-300">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Empire Active</span>
                  </span>
                  <span className="text-purple-400">🎙️💰🚀</span>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}