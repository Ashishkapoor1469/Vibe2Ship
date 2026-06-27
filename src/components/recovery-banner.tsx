'use client';

import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, Zap } from 'lucide-react';

export function RecoveryBanner() {
  const recoveryMode = useLMLSStore((s) => s.recoveryMode);
  const courseCorrectionPlan = useLMLSStore((s) => s.courseCorrectionPlan);
  const setRecoveryMode = useLMLSStore((s) => s.setRecoveryMode);
  const pivot = useLMLSStore((s) => s.pivot);

  if (!recoveryMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="mx-auto mt-2 max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/10 to-amber-500/5 px-4 py-3">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08),transparent_50%)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-300">COURSE CORRECTION MODE</p>
                  <p className="mt-0.5 text-xs text-[#a1a1aa]">
                    Your original plan needed adjustment. I&apos;ve rebuilt your schedule.
                  </p>
                  {courseCorrectionPlan && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-[#71717a]">{courseCorrectionPlan.recoveryTimeline}</p>
                      {courseCorrectionPlan.removedTasks.length > 0 && (
                        <p className="text-[10px] text-[#71717a]">
                          Removed: {courseCorrectionPlan.removedTasks.join(', ')}
                        </p>
                      )}
                      {courseCorrectionPlan.minimumDeliverable && (
                        <p className="text-[10px] text-[#00E599]">
                          <Zap className="mr-1 inline h-3 w-3" />
                          Minimum: {courseCorrectionPlan.minimumDeliverable}
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      pivot();
                      setRecoveryMode(false);
                    }}
                    className="mt-2 flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-[#ffffff]/90 transition-colors hover:bg-white/20"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset & Continue
                  </button>
                </div>
              </div>
              <button
                onClick={() => setRecoveryMode(false)}
                className="shrink-0 rounded p-1 text-[#71717a] hover:text-[#a1a1aa]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
