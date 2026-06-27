'use client';

import { useLMLSStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, Leaf, Shield, Clock, Zap, Brain, Target } from 'lucide-react';

const priorityConfig = {
  critical: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' },
  important: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Important' },
  normal: { icon: Leaf, color: 'text-[#a1a1aa]', bg: 'bg-white/[0.05]', label: 'Normal' },
  low: { icon: Shield, color: 'text-[#71717a]', bg: 'bg-zinc-500/10', label: 'Low' },
};

export function AISituationOverview() {
  const tasks = useLMLSStore((s) => s.tasks);
  const panicScore = useLMLSStore((s) => s.panicScore);
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const analysisInProgress = useLMLSStore((s) => s.analysisInProgress);

  const active = tasks.filter((t) => t.status !== 'completed');

  if (tasks.length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            AI Situation Overview
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/5">
            <Target className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-400">LMLS is ready.</p>
          <p className="text-xs text-zinc-600">Add tasks and I'll build your execution strategy.</p>
        </div>
      </div>
    );
  }

  if (active.length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#00E599]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            AI Situation Overview
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/10">
            <Zap className="h-6 w-6 text-[#00E599]" />
          </div>
          <p className="text-sm font-medium text-[#00E599]">All tasks completed!</p>
          <p className="text-xs text-zinc-600">Great work — add more tasks to continue.</p>
        </div>
      </div>
    );
  }

  const score = panicScore?.score ?? 0;
  const isCritical = score >= 7;
  const isHigh = score >= 4 && score < 7;

  const counts = {
    critical: active.filter((t) => t.priority === 'critical').length,
    important: active.filter((t) => t.priority === 'important').length,
    normal: active.filter((t) => t.priority === 'normal').length,
    low: active.filter((t) => t.priority === 'low').length,
  };

  const deadlines = active
    .filter((t) => t.deadline)
    .map((t) => new Date(t.deadline!).getTime())
    .filter((d) => d > Date.now())
    .sort((a, b) => a - b);

  const nearestDeadline = deadlines[0] ?? null;
  const timeStr = nearestDeadline ? getTimeRemaining(nearestDeadline) : null;

  const completed = tasks.filter((t) => t.status === 'completed').length;

  const panicColor = score >= 8 ? '#EF4444' : score >= 4 ? '#FBBF24' : '#22C55E';
  const circumference = 2 * Math.PI * 42;

  return (
    <div className={`glass p-5 ${isCritical ? 'glow-red' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#A78BFA]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            AI Situation Overview
          </h2>
        </div>
        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-400">
          {active.length} active
        </span>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={panicColor}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - score / 10) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute text-xl font-bold ${score >= 8 ? 'text-red-400' : score >= 4 ? 'text-amber-400' : 'text-[#22C55E]'}`}
          >
            {score.toFixed(1)}
            <span className="text-[9px] text-[#71717a]">/10</span>
          </motion.span>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-[#71717a]">
              <Zap className="h-3 w-3" />
              Overall Panic
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              {panicScore?.reason ?? 'Analyzing your tasks...'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map((key) => {
              if (counts[key] === 0) return null;
              const cfg = priorityConfig[key];
              const Icon = cfg.icon;
              return (
                <div key={key} className={`flex items-center gap-1 rounded-md ${cfg.bg} px-2 py-1`}>
                  <Icon className={`h-3 w-3 ${cfg.color}`} />
                  <span className={`text-[10px] font-medium ${cfg.color}`}>{counts[key]} {cfg.label}</span>
                </div>
              );
            })}
          </div>

          {analysisInProgress && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 text-[10px] text-[#a1a1aa]"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#a1a1aa]" />
              AI analyzing tasks...
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px]">
        {currentFocus && (
          <div className="flex items-center gap-1.5 rounded-md bg-[#00E599]/10 px-2.5 py-1.5 text-[#00E599]">
            <Zap className="h-3 w-3" />
            Focus: {currentFocus}
          </div>
        )}
        {timeStr && (
          <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-zinc-400">
            <Clock className="h-3 w-3" />
            {timeStr} until deadline
          </div>
        )}
        {completed > 0 && (
          <div className="rounded-md bg-[#00E599]/10 px-2.5 py-1.5 text-[#00E599]">
            {completed} completed
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeRemaining(target: number): string {
  const ms = target - Date.now();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
}
