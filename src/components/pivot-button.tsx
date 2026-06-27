'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, Clock, Send, Compass } from 'lucide-react';

export function PivotButton() {
  const pivot = useLMLSStore((s) => s.pivot);
  const triggerCourseCorrection = useLMLSStore((s) => s.triggerCourseCorrection);
  const setRecoveryMode = useLMLSStore((s) => s.setRecoveryMode);
  const [showHoursInput, setShowHoursInput] = useState(false);
  const [hours, setHours] = useState('2');

  const handlePivot = () => setShowHoursInput(true);

  const handleConfirm = () => {
    const h = parseFloat(hours);
    if (h > 0) {
      triggerCourseCorrection(h);
    }
    setShowHoursInput(false);
    setHours('2');
  };

  const handleReset = () => {
    pivot();
    setRecoveryMode(false);
    setShowHoursInput(false);
  };

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center gap-2">
        <Compass className="h-4 w-4 text-[#FBBF24]" />
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
          Pivot Option
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {!showHoursInput ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2"
          >
            <p className="text-xs text-[#71717a]">
              Plan not working? Trigger a course correction.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePivot}
              className="flex items-center gap-1.5 rounded-lg bg-[#FBBF24]/10 px-3 py-2 text-[10px] font-medium text-[#FBBF24] transition-colors hover:bg-[#FBBF24]/20"
            >
              <RefreshCw className="h-3 w-3" />
              PIVOT
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#71717a]" />
              <span className="text-[10px] text-[#71717a]">How many hours left?</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-20 rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                placeholder="2"
              />
              <span className="text-[10px] text-[#71717a]">hours</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <AlertTriangle className="h-3 w-3" />
                Rebuild
              </motion.button>
              <button
                onClick={handleReset}
                className="rounded-lg px-2 py-1.5 text-[10px] text-[#71717a] hover:text-[#a1a1aa]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
