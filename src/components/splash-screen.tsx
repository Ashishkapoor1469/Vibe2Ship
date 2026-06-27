'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  BarChart3,
  Settings,
  Bot,
} from 'lucide-react';

const EASE = [0.25, 1, 0.5, 1] as const;

// ─── 4-Pointed Star ─────────────────────────────────────────────
export function StarIcon({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <linearGradient id="star-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#E9407D" />
        </linearGradient>
      </defs>
      <path
        d="M50 0 C53 30, 70 47, 100 50 C70 53, 53 70, 50 100 C47 70, 30 53, 0 50 C30 47, 47 30, 50 0Z"
        fill="url(#star-grad)"
      />
    </svg>
  );
}

// ─── Splash Screen ──────────────────────────────────────────────
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<
    'start' | 'scaleIn' | 'squish' | 'snapBack' | 'explode' | 'done'
  >('start');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scaleIn'), 100);
    const t2 = setTimeout(() => setPhase('squish'), 900);
    const t3 = setTimeout(() => setPhase('snapBack'), 1050);
    const t4 = setTimeout(() => setPhase('explode'), 1150);
    const t5 = setTimeout(() => {
      setPhase('done');
      setTimeout(onDone, 300);
    }, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const handleSkip = () => {
    setPhase('done');
    setTimeout(onDone, 100);
  };

  const isExploding = phase === 'explode';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white"
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            key="splash-content"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.div
              animate={{
                scaleX:
                  phase === 'squish' ? 1.12
                  : phase === 'snapBack' ? 1
                  : 1,
                scaleY:
                  phase === 'squish' ? 0.7
                  : phase === 'snapBack' ? 1
                  : 1,
                scale:
                  phase === 'start' ? 0
                  : isExploding ? 80
                  : 1,
                rotate:
                  phase === 'start' ? -45
                  : isExploding ? 25
                  : 0,
                opacity:
                  phase === 'start' ? 0
                  : isExploding ? 0
                  : 1,
              }}
              transition={{
                scaleX: {
                  duration: phase === 'squish' ? 0.12 : phase === 'snapBack' ? 0.18 : 0.01,
                  ease: phase === 'squish'
                    ? ([0.45, 0, 1, 1] as const)
                    : phase === 'snapBack'
                      ? ([0, 0, 0.2, 1] as const)
                      : ([0.25, 1, 0.5, 1] as const),
                },
                scaleY: {
                  duration: phase === 'squish' ? 0.12 : phase === 'snapBack' ? 0.18 : 0.01,
                  ease: phase === 'squish'
                    ? ([0.45, 0, 1, 1] as const)
                    : phase === 'snapBack'
                      ? ([0, 0, 0.2, 1] as const)
                      : ([0.25, 1, 0.5, 1] as const),
                },
                scale: {
                  duration: phase === 'scaleIn' ? 0.7 : isExploding ? 0.8 : 0.01,
                  ease: [0.25, 1, 0.5, 1] as const,
                },
                rotate: {
                  duration: phase === 'scaleIn' ? 0.7 : isExploding ? 0.8 : 0.01,
                  ease: [0.25, 1, 0.5, 1] as const,
                },
                opacity: {
                  duration: phase === 'scaleIn' ? 0.7 : isExploding ? 0.8 : 0.01,
                  ease: [0.25, 1, 0.5, 1] as const,
                },
              }}
            >
              <StarIcon size={48} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'start' && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 rounded-lg border border-zinc-200 px-3 py-1.5 text-[10px] text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600"
        >
          Skip →
        </button>
      )}
    </motion.div>
  );
}

// ─── Sidebar nav items ──────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Dashboard Shell Layout ─────────────────────────────────────
export function DashboardShell({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState('overview');

  return (
    <div className="flex h-screen w-full bg-[#09090b]">
      {/* ── Sidebar ── */}
      <aside className="flex w-56 flex-col border-r border-[#27272a] bg-[#121214] shrink-0">
        <div className="flex h-14 items-center gap-2.5 border-b border-[#27272a] px-5">
          <StarIcon size={20} />
          <span className="text-sm font-bold tracking-tight text-white">LMLS</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-[#a1a1aa] hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#27272a] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5">
              <Bot className="h-3.5 w-3.5 text-[#00E599]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-white truncate">AI Execution Partner</p>
              <p className="text-[9px] text-[#00E599] truncate">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
