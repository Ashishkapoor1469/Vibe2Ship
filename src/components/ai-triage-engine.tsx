'use client';

import { useLMLSStore } from '@/lib/store';
import { Task } from '@/lib/engine/types';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, Leaf, Clock, Target, Zap, Shield } from 'lucide-react';

const priorityConfig = {
  critical: {
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Critical',
    glow: 'glow-red',
  },
  important: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'Important',
    glow: 'glow-amber',
  },
  normal: {
    icon: Leaf,
    color: 'text-zinc-400',
    bg: 'bg-white/[0.05]',
    border: 'border-zinc-400/20',
    label: 'Normal',
    glow: '',
  },
  low: {
    icon: Shield,
    color: 'text-zinc-500',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
    label: 'Low',
    glow: '',
  },
};

export function AITriageEngine() {
  const panicScore = useLMLSStore((s) => s.panicScore);
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const tasks = useLMLSStore((s) => s.tasks);

  if (!currentFocus) {
    return (
      <div className="glass p-5">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          AI Triage Engine
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="mb-2 h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">No active tasks.</p>
          <p className="text-xs text-zinc-600">Add a task to start triage.</p>
        </div>
      </div>
    );
  }

  const score = panicScore?.score ?? 0;
  const priority = score >= 7 ? 'critical' : score >= 4 ? 'important' : score >= 2 ? 'normal' : 'low';
  const config = priorityConfig[priority];

  const PriorityIcon = config.icon;
  const isCritical = priority === 'critical';

  const riskLabel = score >= 8 ? 'Extreme' : score >= 6 ? 'High' : score >= 4 ? 'Moderate' : 'Low';
  const riskColor = score >= 8 ? 'text-red-400' : score >= 6 ? 'text-amber-400' : score >= 4 ? 'text-[#a1a1aa]' : 'text-zinc-400';

  const timeRemaining = getTimeRemaining(tasks);

  return (
    <div className={`glass ${isCritical ? config.glow : ''} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          AI Triage Engine
        </h2>
        <div className={`flex items-center gap-1.5 rounded-full ${config.bg} px-2.5 py-1`}>
          <PriorityIcon className={`h-3 w-3 ${config.color}`} />
          <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-5">
        <div className="relative flex items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={isCritical ? '#EF4444' : score >= 4 ? '#FBBF24' : '#22C55E'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 10),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className={`absolute text-2xl font-bold ${isCritical ? 'panic-animate text-red-400' : 'text-[#a1a1aa]'}`}
          >
            {score}
            <span className="text-xs text-zinc-500">/10</span>
          </motion.div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Target className="h-3 w-3" />
              Current Focus
            </div>
            <p className="text-sm font-medium text-white">{currentFocus}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
              <Zap className={`h-3 w-3 ${riskColor}`} />
              <span className={`text-[10px] ${riskColor}`}>Risk: {riskLabel}</span>
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                <Clock className="h-3 w-3 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">{timeRemaining} remaining</span>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-white/[0.03] p-2"
          >
            <div className="flex items-start gap-1.5">
              <span className="text-[10px] text-zinc-500">Why:</span>
              <p className="text-[10px] leading-relaxed text-zinc-400">{panicScore?.reason}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['critical', 'important', 'normal', 'low'] as const).map((level) => {
          const count = tasks.filter((t) => t.priority === level).length;
          const pc = priorityConfig[level];
          const Icon = pc.icon;
          return (
            <div
              key={level}
              className={`flex flex-1 items-center gap-1.5 rounded-md ${pc.bg} px-2 py-1.5`}
            >
              <Icon className={`h-3 w-3 ${pc.color}`} />
              <span className={`text-[10px] font-medium ${pc.color}`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeRemaining(tasks: Task[]): string | null {
  const deadlines = tasks
    .filter((t) => t.deadline)
    .map((t) => new Date(t.deadline!).getTime())
    .filter((d) => d > Date.now())
    .sort((a, b) => a - b);

  if (deadlines.length === 0) return null;

  const ms = deadlines[0] - Date.now();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${mins}m`;
}
