'use client';

import { useLMLSStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Clock, BarChart3, Zap, Target } from 'lucide-react';

export function MemoryInsights() {
  const memory = useLMLSStore((s) => s.memory);

  if (memory.totalTasksCompleted === 0 && memory.missedDeadlines === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Productivity Memory
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Target className="mb-2 h-8 w-8 text-[#71717a]" />
          <p className="text-xs text-[#71717a]">
            Complete tasks to build your productivity memory.
          </p>
          <p className="text-[10px] text-[#71717a]">
            I&apos;ll learn your patterns and adapt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#A78BFA]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Productivity Memory
          </h2>
        </div>
        <Brain className="h-3.5 w-3.5 text-[#71717a]" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[#22C55E]/10 p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-[#22C55E]">
            <TrendingUp className="h-3 w-3" />
            Completed
          </div>
          <p className="text-lg font-bold text-white">{memory.totalTasksCompleted}</p>
        </div>
        <div className="rounded-lg bg-red-500/10 p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-red-400">
            <AlertTriangle className="h-3 w-3" />
            Missed
          </div>
          <p className="text-lg font-bold text-white">{memory.missedDeadlines}</p>
        </div>
        <div className="rounded-lg bg-[#FBBF24]/10 p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-[#FBBF24]">
            <Clock className="h-3 w-3" />
            Overest.
          </div>
          <p className="text-lg font-bold text-white">~{memory.averageOverestimation}%</p>
        </div>
        <div className="rounded-lg bg-white/[0.05] p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-[#a1a1aa]">
            <BarChart3 className="h-3 w-3" />
            Rate
          </div>
          <p className="text-lg font-bold text-white">
            {memory.totalTasksCompleted > 0
              ? Math.round(
                  (memory.totalTasksCompleted /
                    (memory.totalTasksCompleted + memory.missedDeadlines)) *
                    100,
                )
              : 0}%
          </p>
        </div>
      </div>

      {memory.averageOverestimation > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-md bg-amber-500/5 px-2.5 py-2"
        >
          <Zap className="h-3 w-3 text-[#FBBF24]" />
          <p className="text-[10px] text-[#FBBF24]">
            You usually underestimate effort by ~{memory.averageOverestimation}%.
            I&apos;ve adjusted your schedule buffers.
          </p>
        </motion.div>
      )}

      {memory.difficultCategories.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[9px] text-[#71717a]">Tricky categories:</p>
          <div className="flex flex-wrap gap-1">
            {memory.difficultCategories.slice(0, 3).map((d) => (
              <span
                key={d.category}
                className="rounded bg-white/[0.03] px-2 py-0.5 text-[9px] text-[#a1a1aa]"
              >
                {d.category} ({d.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
