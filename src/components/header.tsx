'use client';

import { useLMLSStore } from '@/lib/store';
import { EnergyLevel } from '@/lib/engine/types';
import { motion } from 'framer-motion';
import { Zap, Battery, BatteryLow, BatteryFull, AlertTriangle, Brain } from 'lucide-react';

const energyIcons: Record<EnergyLevel, React.ReactNode> = {
  low: <BatteryLow className="h-4 w-4" />,
  normal: <Battery className="h-4 w-4" />,
  high: <BatteryFull className="h-4 w-4" />,
};

const energyColors: Record<EnergyLevel, string> = {
  low: 'text-red-400',
  normal: 'text-amber-400',
  high: 'text-[#00E599]',
};

export function Header() {
  const energyLevel = useLMLSStore((s) => s.energyLevel);
  const setEnergyLevel = useLMLSStore((s) => s.setEnergyLevel);
  const tasks = useLMLSStore((s) => s.tasks);
  const recoveryMode = useLMLSStore((s) => s.recoveryMode);
  const panicScore = useLMLSStore((s) => s.panicScore);
  const plannedCount = tasks.filter((t) => t.status !== 'completed').length;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isEmergency = (panicScore?.score ?? 0) >= 7;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isEmergency ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5"
          >
            <Brain className="h-5 w-5 text-[#00E599]" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">LMLS</span>
              <span className="text-[10px] text-[#71717a]">— Your AI Execution Partner</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#71717a]">
              <span>{dateStr}</span>
              <span>·</span>
              <span>{timeStr}</span>
              <span>·</span>
              <span>{plannedCount} active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {recoveryMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-medium text-red-400"
            >
              <AlertTriangle className="h-3 w-3" />
              Recovery Mode
            </motion.div>
          )}

          {isEmergency && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold text-red-400"
            >
              <Zap className="h-3 w-3" />
              EMERGENCY
            </motion.div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
            <span className="text-[10px] text-[#71717a]">Energy</span>
            <div className="flex gap-0.5">
              {(['low', 'normal', 'high'] as EnergyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`rounded p-0.5 transition-colors ${
                    energyLevel === level
                      ? `${energyColors[level]} bg-white/[0.05]`
                      : 'text-[#71717a] hover:text-[#a1a1aa]'
                  }`}
                  title={level}
                >
                  {energyIcons[level]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
