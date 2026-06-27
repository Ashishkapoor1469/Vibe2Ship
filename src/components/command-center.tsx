'use client';

import { useLMLSStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, Leaf, Shield, Target, Clock, Brain, Zap, Battery, BatteryFull, BatteryLow } from 'lucide-react';

export function CommandCenter() {
  const tasks = useLMLSStore((s) => s.tasks);
  const panicScore = useLMLSStore((s) => s.panicScore);
  const memory = useLMLSStore((s) => s.memory);
  const userProfile = useLMLSStore((s) => s.userProfile);
  const energyLevel = useLMLSStore((s) => s.energyLevel);

  const active = tasks.filter((t) => t.status !== 'completed');
  const completed = tasks.filter((t) => t.status === 'completed');

  const critical = active.filter((t) => t.priority === 'critical').length;
  const important = active.filter((t) => t.priority === 'important').length;
  const normal = active.filter((t) => t.priority === 'normal').length;

  const energyLabel = energyLevel === 'high' ? 'High' : energyLevel === 'normal' ? 'Normal' : 'Low';
  const energyColor = energyLevel === 'high' ? 'text-[#00E599]' : energyLevel === 'normal' ? 'text-[#FBBF24]' : 'text-red-400';
  const EnergyIcon = energyLevel === 'high' ? BatteryFull : energyLevel === 'normal' ? Battery : BatteryLow;

  const hoursAvailable = userProfile?.availableHoursToday ?? 6;
  const totalEstHours = active.reduce((s, t) => s + t.estimatedHours, 0);
  const feasible = totalEstHours <= hoursAvailable;

  if (active.length === 0) {
    return (
      <div className="glass p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03]">
            <Brain className="h-5 w-5 text-[#71717a]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#a1a1aa]">Today&apos;s Mission</p>
            <p className="text-sm text-[#71717a]">AI is waiting for your tasks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5">
            <Brain className="h-5 w-5 text-[#00E599]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#a1a1aa]">Today&apos;s Mission</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-white">{active.length}</span>
              <span className="text-[#a1a1aa]">tasks</span>
              <span className="text-[#71717a]">·</span>
              <span className="text-[#a1a1aa]">{totalEstHours.toFixed(1)}h est.</span>
              <span className="text-[#71717a]">·</span>
              <span className="text-[#a1a1aa]">{hoursAvailable}h available</span>
              {!feasible && (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">Overloaded</span>
              )}
              <span className="text-[#71717a]">·</span>
              <span className={`text-[10px] font-medium ${energyColor}`}>
                <EnergyIcon className="mr-0.5 inline h-3 w-3" />
                {energyLabel} energy
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
            <div className="flex gap-1.5">
              {critical > 0 && (
                <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                  <Flame className="h-3 w-3" />
                  {critical}
                </span>
              )}
              {important > 0 && (
                <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {important}
                </span>
              )}
              {normal > 0 && (
                <span className="flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-[#a1a1aa]">
                  <Leaf className="h-3 w-3" />
                  {normal}
                </span>
              )}
            </div>
          </div>

          {panicScore && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              panicScore.score >= 8 ? 'bg-red-500/10' : panicScore.score >= 4 ? 'bg-amber-500/10' : 'bg-[#22C55E]/10'
            }`}>
              <Clock className={`h-3 w-3 ${
                panicScore.score >= 8 ? 'text-red-400' : panicScore.score >= 4 ? 'text-amber-400' : 'text-[#22C55E]'
              }`} />
              <span className={`text-xs font-bold ${
                panicScore.score >= 8 ? 'text-red-400' : panicScore.score >= 4 ? 'text-amber-400' : 'text-[#22C55E]'
              }`}>
                Panic {panicScore.score}/10
              </span>
            </div>
          )}

          {completed.length > 0 && (
            <div className="rounded-lg bg-[#00E599]/10 px-3 py-1.5 text-[10px] text-[#00E599]">
              {completed.length} done
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
