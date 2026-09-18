import type { Metadata } from 'next';
import './globals.css';
import { Zap, Cpu, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Campus Energy Dispatch | BUP CSE Fest 2026',
  description: 'Industrial-grade 24-hour campus microgrid energy optimization engine and autonomous dispatch command center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-zinc-50 text-zinc-950 min-h-screen flex flex-col font-sans antialiased selection:bg-zinc-200 selection:text-zinc-900">
        {/* Sticky Executive Navigation Header */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand and University Microgrid Info */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* High-contrast bold logo badge */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-950 text-white shadow-sm">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-zinc-950 tracking-tight">
                    Smart Campus Energy Dispatch
                  </span>
                  <span className="hidden sm:inline-flex bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 text-xs font-semibold rounded-md">
                    BUP CSE Fest 2026 • Autonomous Microgrid Controller
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <span className="font-mono text-zinc-700 font-medium">Campus Grid 24h Horizon</span>
                  <span className="text-zinc-300">•</span>
                  <span>Linear Programming Cost Minimization</span>
                </div>
              </div>
            </div>

            {/* Right Telemetry & Navigation Actions */}
            <div className="flex items-center space-x-3">
              {/* Live status badge: Pure white/light-emerald pill with solid green pulsing dot */}
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-mono">Engine: Operational</span>
              </div>

              {/* Secondary button: Architecture & Specs */}
              <a
                href="#system-docs"
                className="hidden md:inline-flex items-center space-x-1.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-600" />
                <span>Architecture &amp; Specs</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Executive Footer */}
        <footer className="w-full border-t border-zinc-200 bg-white py-4 mt-auto text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-zinc-700">
                BUP CSE Fest 2026 — Smart Campus Energy Optimization Challenge
              </span>
            </div>
            <div className="font-mono text-zinc-500">
              Person 1 (Frontend &amp; DevOps) • Next.js 15 Standalone
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
