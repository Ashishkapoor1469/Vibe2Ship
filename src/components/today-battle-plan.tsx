'use client';

import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Zap, Coffee, Shield, Brain, AlertTriangle } from 'lucide-react';

const typeConfig: Record<string, { color: string; label: string }> = {
  'deep-work': { color: 'border-l-[#00E599] bg-[#00E599]/5', label: 'Deep Work' },
  maintenance: { color: 'border-l-[#a1a1aa] bg-white/[0.03]', label: 'Task' },
  break: { color: 'border-l-[#00E599] bg-[#00E599]/5', label: 'Break' },
  buffer: { color: 'border-l-[#FBBF24] bg-[#FBBF24]/5', label: 'Buffer' },
  review: { color: 'border-l-[#a1a1aa] bg-white/[0.03]', label: 'Review' },
};

export function TodayBattlePlan() {
  const schedule = useLMLSStore((s) => s.schedule);
  const tasks = useLMLSStore((s) => s.tasks);
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const planStatus = useLMLSStore((s) => s.planStatus);
  const planDraft = useLMLSStore((s) => s.planDraft);
  const generatePlanWithAI = useLMLSStore((s) => s.generatePlanWithAI);
  const isGenerating = useLMLSStore((s) => s.isGenerating);
  const generateProgress = useLMLSStore((s) => s.generateProgress);

  const active = tasks.filter((t) => t.status !== 'completed');
  const isConfirmed = planStatus === 'confirmed';

  if (tasks.length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Today&apos;s Battle Plan
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/5">
            <Brain className="h-6 w-6 text-[#71717a]" />
          </div>
          <p className="text-sm font-medium text-[#a1a1aa]">LMLS is ready.</p>
          <p className="text-xs text-[#71717a]">Add tasks and I'll build your execution strategy.</p>
        </div>
      </div>
    );
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#FBBF24]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Today&apos;s Battle Plan
          </h2>
        </div>
        {isConfirmed && schedule.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-[#00E599]/10 px-2 py-0.5 text-[9px] text-[#00E599]">
              <Zap className="h-3 w-3" />
              Active
            </span>
            <span className="text-[10px] text-[#71717a]">
              {schedule.filter((b) => b.type !== 'break').length} blocks
            </span>
          </div>
        )}
      </div>

      {/* Has confirmed plan */}
      {isConfirmed && schedule.length > 0 && (
        <div className="space-y-1">
          <AnimatePresence>
            {schedule.map((block, i) => {
              const config = typeConfig[block.type] ?? typeConfig.maintenance;
              const mins = Math.round(
                (block.end.getTime() - block.start.getTime()) / 60000,
              );
              const isNow = block.start <= new Date() && block.end >= new Date();

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-3 border-l-2 px-3 py-2 rounded-r-lg ${config.color} ${isNow ? 'ring-1 ring-[#00E599]/20' : ''}`}
                >
                  <span className="min-w-[52px] font-mono text-[10px] tabular-nums text-[#71717a]">
                    {fmt(block.start)}
                  </span>
                  <span className="flex-1 text-xs text-[#ffffff]/90">{block.title}</span>
                  <div className="flex items-center gap-1.5">
                    {block.type === 'break' ? (
                      <Coffee className="h-3 w-3 text-[#00E599]" />
                    ) : block.type === 'buffer' ? (
                      <Shield className="h-3 w-3 text-[#FBBF24]" />
                    ) : (
                      <Zap className="h-3 w-3 text-[#a1a1aa]" />
                    )}
                    <span className="text-[9px] text-[#71717a]">{mins}m</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmed plan but no schedule */}
      {isConfirmed && schedule.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Target className="mb-2 h-6 w-6 text-[#71717a]" />
          <p className="text-xs text-[#71717a]">Plan is activated. No schedule generated.</p>
        </div>
      )}

      {/* Not confirmed yet — show generate button */}
      {!isConfirmed && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          {active.length > 0 ? (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24]/10">
                <AlertTriangle className="h-6 w-6 text-[#FBBF24]" />
              </div>
              <p className="text-sm font-medium text-[#ffffff]/90">
                {active.length} task{active.length !== 1 ? 's' : ''} ready for planning
              </p>
              <p className="mb-4 text-xs text-[#71717a]">
                Click generate and I'll build your battle plan.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generatePlanWithAI}
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {generateProgress || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate My Plan
                  </>
                )}
              </motion.button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Brain className="mb-2 h-6 w-6 text-[#71717a]" />
              <p className="text-xs text-[#71717a]">All tasks completed. Great work!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
