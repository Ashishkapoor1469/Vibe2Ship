'use client';

import { useLMLSStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Calendar, Clock, Coffee, Shield, Zap, BookOpen } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'deep-work': { icon: <Zap className="h-3 w-3" />, color: 'text-zinc-400 bg-white/[0.03]', label: 'Deep Work' },
  maintenance: { icon: <BookOpen className="h-3 w-3" />, color: 'text-zinc-400 bg-white/[0.03]', label: 'Task' },
  break: { icon: <Coffee className="h-3 w-3" />, color: 'text-emerald-400 bg-emerald-500/10', label: 'Break' },
  buffer: { icon: <Shield className="h-3 w-3" />, color: 'text-amber-400 bg-amber-500/10', label: 'Buffer' },
  review: { icon: <BookOpen className="h-3 w-3" />, color: 'text-zinc-400 bg-white/[0.03]', label: 'Review' },
};

export function SchedulerView() {
  const schedule = useLMLSStore((s) => s.schedule);

  if (schedule.length === 0) {
    return (
      <div className="glass p-5">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Today&apos;s Schedule
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">No schedule yet.</p>
          <p className="text-xs text-zinc-600">Generate a plan to build your day.</p>
        </div>
      </div>
    );
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Today&apos;s Schedule
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Clock className="h-3 w-3" />
          {schedule.length} blocks
        </div>
      </div>

      <div className="space-y-1">
        {schedule.map((block, i) => {
          const config = typeConfig[block.type] ?? typeConfig.maintenance;
          const mins = Math.round(
            (block.end.getTime() - block.start.getTime()) / 60000,
          );

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 rounded-md px-3 py-2 ${config.color} bg-opacity-50`}
            >
              <span className="min-w-[68px] font-mono text-[10px] tabular-nums text-zinc-400">
                {fmt(block.start)}
              </span>
              <span className="flex-1 text-xs text-zinc-200">
                {block.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
                  {mins}m
                </span>
                <span className={config.color.split(' ')[0]}>
                  {config.icon}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
