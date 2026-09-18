import type { Metadata } from 'next';
import './globals.css';
import { Zap, Cpu, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Campus Energy Dispatch | BUP CSE Fest 2026',
  description: 'AI-driven 24-hour campus microgrid energy optimization engine and dispatch control center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {/* Sticky Executive Navigation Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand and University Microgrid Info */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-purple-500/20 border border-slate-700/60 shadow-inner">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                    Smart Campus Energy Dispatch
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                    BUP CSE Fest 2026
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400/90">Campus Grid 24h Horizon</span>
                  <span className="text-slate-600">•</span>
                  <span>Autonomous Microgrid Controller</span>
                </div>
              </div>
            </div>

            {/* Live Status and Navigation Actions */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Pulsing Live Engine Status Badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-slate-200 font-medium">Microgrid Engine: Ready</span>
              </div>

              {/* Quick Specs Link */}
              <a
                href="#system-docs"
                className="hidden md:inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors py-1.5 px-2.5 rounded-md hover:bg-slate-900 border border-transparent hover:border-slate-800"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Specs &amp; Architecture</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Executive Footer */}
        <footer className="w-full border-t border-slate-900/90 bg-slate-950/60 py-4 mt-auto text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
              <span>BUP CSE Fest 2026 — Smart Campus Energy Optimization Challenge</span>
            </div>
            <div className="font-mono text-slate-600">
              Person 1 (Frontend &amp; DevOps) • Next.js 15 Standalone
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
