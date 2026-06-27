'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  AlertTriangle,
  Shield,
  Clock,
  Zap,
  Brain,
  Check,
  Edit3,
  Trash2,
  GripVertical,
  Save,
} from 'lucide-react';

export function PlanReviewDialog() {
  const planDraft = useLMLSStore((s) => s.planDraft);
  const planStatus = useLMLSStore((s) => s.planStatus);
  const confirmPlan = useLMLSStore((s) => s.confirmPlan);
  const cancelPlan = useLMLSStore((s) => s.cancelPlan);
  const setPlanDraft = useLMLSStore((s) => s.setPlanDraft);

  const [editMode, setEditMode] = useState(false);
  const [editedSteps, setEditedSteps] = useState<{ title: string; duration: string }[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  const isOpen = planDraft && planStatus === 'draft';

  if (!isOpen) return null;

  const panic = planDraft.panicScore ?? 0;
  const isCritical = panic >= 7;
  const isHigh = panic >= 5 && panic < 7;

  const steps = planDraft.atomicSteps ?? [];
  const schedule = planDraft.schedule ?? [];

  const handleOpenEdit = () => {
    setEditMode(true);
    setEditedSteps(steps.map((s) => ({ title: s.title, duration: s.duration })));
    setSelectedPriority(planDraft.priority);
  };

  const handleSaveEdit = () => {
    const updated = { ...planDraft };
    if (selectedPriority) updated.priority = selectedPriority as any;
    if (editedSteps.length === steps.length) {
      updated.atomicSteps = steps.map((s, i) => ({
        ...s,
        title: editedSteps[i]?.title ?? s.title,
        duration: editedSteps[i]?.duration ?? s.duration,
      }));
    }
    setPlanDraft(updated);
    setEditMode(false);
  };

  const handleStepChange = (idx: number, field: 'title' | 'duration', value: string) => {
    const updated = [...editedSteps];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedSteps(updated);
  };

  const getPanicColor = () => {
    if (panic >= 7) return { stroke: '#EF4444', text: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' };
    if (panic >= 4) return { stroke: '#FBBF24', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'High' };
    return { stroke: '#00E599', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Normal' };
  };

  const pc = getPanicColor();
  const circumference = 2 * Math.PI * 36;

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-red-400';
      case 'important': return 'text-amber-400';
      case 'normal': return 'text-zinc-400';
      default: return 'text-[#a1a1aa]';
    }
  };

  const priorityLabel = (p: string) => {
    switch (p) {
      case 'critical': return '🔥 Critical';
      case 'important': return '⚡ Important';
      case 'normal': return '📋 Normal';
      default: return '⬇ Low';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !editMode) cancelPlan();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#27272a] bg-[#18181b] shadow-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#27272a] bg-[#18181b] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5">
                <Zap className="h-5 w-5 text-[#00E599]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">AI Generated Battle Plan</h2>
                <p className="text-[10px] text-[#71717a]">
                  LMLS created this plan from your tasks, deadlines, and available time.
                </p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={cancelPlan}
                className="rounded-lg p-2 text-[#71717a] hover:bg-white/[0.03] hover:text-[#ffffff]/90"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-5 px-6 py-5">
            {/* AI Analysis Section */}
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#A78BFA]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">
                  AI Analysis
                </span>
              </div>
              <div className="flex items-start gap-5">
                {/* Panic circle */}
                <div className="relative flex shrink-0 items-center justify-center">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="36"
                      fill="none"
                      stroke={pc.stroke}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference * (1 - panic / 10) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute text-lg font-bold ${pc.text}`}
                  >
                    {panic.toFixed(1)}
                    <span className="text-[8px] text-[#71717a]">/10</span>
                  </motion.span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md ${pc.bg} px-2.5 py-1 text-xs font-semibold ${pc.text}`}>
                      {priorityLabel(planDraft.priority)}
                    </span>
                    <span className="text-[10px] text-[#71717a]">Panic Score</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#a1a1aa]">
                    {planDraft.reason || 'AI analysis complete.'}
                  </p>
                  {planDraft.focusTask && (
                    <div className="flex items-center gap-1.5 rounded-md bg-[#00E599]/10 px-2.5 py-1.5">
                      <Zap className="h-3 w-3 text-[#00E599]" />
                      <span className="text-[10px] font-medium text-[#00E599]">
                        Focus: {planDraft.focusTask}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#a1a1aa]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">
                  Schedule Preview
                </span>
              </div>
              <div className="space-y-1.5">
                {schedule.length === 0 ? (
                  <p className="text-xs text-[#71717a]">No schedule generated.</p>
                ) : (
                  schedule.slice(0, 6).map((block, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border-l-2 border-l-[#00E599]/30 bg-white/[0.03] px-3 py-2"
                    >
                      <span className="min-w-[62px] font-mono text-[10px] tabular-nums text-[#71717a]">
                        {block.start} — {block.end}
                      </span>
                      <span className="flex-1 text-xs text-[#ffffff]/90">{block.task}</span>
                    </div>
                  ))
                )}
                {schedule.length > 6 && (
                  <p className="text-center text-[9px] text-[#71717a]">
                    +{schedule.length - 6} more blocks
                  </p>
                )}
              </div>
            </div>

            {/* Atomic Steps Preview */}
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FBBF24]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">
                  {editMode ? 'Edit Atomic Steps' : 'Atomic Steps Preview'}
                </span>
              </div>
              <div className="space-y-1.5">
                {(editMode ? editedSteps : steps).length === 0 ? (
                  <p className="text-xs text-[#71717a]">No steps generated.</p>
                ) : (
                  (editMode ? editedSteps : steps).map((step, i) => {
                    const originalStep = steps[i];
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00E599]/10 text-[9px] font-bold text-[#00E599]">
                          {i + 1}
                        </span>
                        {editMode ? (
                          <div className="flex flex-1 items-center gap-2">
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleStepChange(i, 'title', e.target.value)}
                              className="min-w-0 flex-1 rounded-md bg-white/[0.03] px-2 py-1 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                            />
                            <input
                              type="text"
                              value={step.duration}
                              onChange={(e) => handleStepChange(i, 'duration', e.target.value)}
                              className="w-20 rounded-md bg-white/[0.03] px-2 py-1 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                            />
                            <span className="text-[9px] text-[#71717a]">min</span>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-xs text-[#ffffff]/90">{step.title}</span>
                            <span className="rounded bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-[#71717a]">
                              {originalStep?.duration || step.duration || '15'} min
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#27272a] bg-[#18181b] px-6 py-4">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium"
                >
                  Cancel Edit
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes & Activate
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={cancelPlan}
                  className="btn-danger flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleOpenEdit}
                  className="btn-secondary flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Plan
                </button>
                <button
                  onClick={confirmPlan}
                  className="btn-primary flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirm & Start Plan
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
