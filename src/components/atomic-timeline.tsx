'use client';

import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Lock,
  Play,
  Clock,
  Flame,
  AlertTriangle,
  Target,
  Layers,
  Circle,
} from 'lucide-react';

export function AtomicTimeline() {
  const tasks = useLMLSStore((s) => s.tasks);
  const atomicSteps = useLMLSStore((s) => s.atomicSteps);
  const toggleStep = useLMLSStore((s) => s.toggleAtomicStep);
  const selectedTaskId = useLMLSStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useLMLSStore((s) => s.setSelectedTaskId);
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const planStatus = useLMLSStore((s) => s.planStatus);

  const active = tasks.filter((t) => t.status !== 'completed');

  if (active.length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Atomic Execution Timeline
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/5">
            <Target className="h-6 w-6 text-[#71717a]" />
          </div>
          <p className="text-sm font-medium text-[#a1a1aa]">LMLS is ready.</p>
          <p className="text-xs text-[#71717a]">Add tasks and I'll build your execution strategy.</p>
        </div>
      </div>
    );
  }

  // Filter steps by selected task, or show all
  const showAll = selectedTaskId === null;
  const filteredSteps = showAll
    ? atomicSteps
    : atomicSteps.filter((s) => s.taskId === selectedTaskId);

  const completed = filteredSteps.filter((s) => s.completed).length;
  const progress = filteredSteps.length > 0 ? Math.round((completed / filteredSteps.length) * 100) : 0;

  const priorityIcon = (p: string) => {
    switch (p) {
      case 'critical': return <Flame className="h-3 w-3 text-red-400" />;
      case 'important': return <AlertTriangle className="h-3 w-3 text-amber-400" />;
      default: return <Circle className="h-3 w-3 text-zinc-400" />;
    }
  };

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#a1a1aa]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Atomic Execution Timeline
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#71717a]">
          {filteredSteps.length > 0 && (
            <span>{completed}/{filteredSteps.length} done</span>
          )}
          {progress > 0 && (
            <>
              <span className="text-[#71717a]">·</span>
              <span className="text-[#00E599]">{progress}%</span>
            </>
          )}
        </div>
      </div>

      {/* Task selector */}
      {active.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedTaskId(null)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
              showAll
                ? 'bg-[#00E599]/15 text-[#00E599] ring-1 ring-[#00E599]/30'
                : 'bg-white/[0.03] text-[#71717a] hover:bg-white/[0.05] hover:text-[#ffffff]/90'
            }`}
          >
            <Layers className="mr-1 inline h-3 w-3" />
            All Tasks
          </button>
          {active.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                selectedTaskId === task.id
                  ? 'bg-[#00E599]/15 text-[#00E599] ring-1 ring-[#00E599]/30'
                  : 'bg-white/[0.03] text-[#71717a] hover:bg-white/[0.05] hover:text-[#ffffff]/90'
              }`}
            >
              {priorityIcon(task.priority)}
              <span className="truncate max-w-[80px]">{task.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {filteredSteps.length > 0 && (
        <motion.div
          className="mb-4 h-1 overflow-hidden rounded-full progress-track"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {filteredSteps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Play className="mb-2 h-6 w-6 text-[#71717a]" />
          <p className="text-xs text-[#71717a]">
            {showAll ? 'No steps generated yet. Generate a plan.' : 'No steps for this task.'}
          </p>
        </div>
      ) : (
        <div className="steps-list max-h-[400px] space-y-0 overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredSteps.map((step, i) => {
              const isActive = !step.completed && step.status === 'ready';
              const isLocked = step.status === 'locked' && !step.completed;
              const isDone = step.completed;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => !isLocked && toggleStep(step.id)}
                      disabled={isLocked}
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                          ? 'border-[#22C55E] bg-[#22C55E] text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                          : isActive
                            ? 'border-[#00E599]/50 bg-[#00E599]/10 text-[#00E599] shadow-[0_0_12px_rgba(0,229,153,0.1)]'
                            : 'border-[#27272a] bg-[#1c1c1f]/80 text-[#71717a]'
                      } ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#00E599]'}`}
                    >
                      {isDone ? (
                        <Check className="h-3 w-3" />
                      ) : isActive ? (
                        <Play className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                    </button>
                    {i < filteredSteps.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium ${
                        isDone ? 'text-[#00E599]' :                         isActive ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                      }`}>
                        {step.estimatedMinutes} min
                      </span>
                      {isDone && (
                        <span className="text-[9px] text-[#00E599]">✓ Done</span>
                      )}
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-[9px] font-medium text-[#00E599]"
                        >
                          Current Focus
                        </motion.span>
                      )}
                    </div>

                    <p className={`text-sm leading-snug ${
                      isDone
                        ? 'text-[#71717a] line-through'
                        : isLocked
                          ? 'text-[#71717a]'
                          : 'text-[#ffffff]/90'
                    }`}>
                      {step.title}
                    </p>

                    {step.goal && !isDone && (
                      <p className="mt-0.5 text-[10px] text-[#71717a]">
                        → {step.goal}
                      </p>
                    )}

                    {step.tip && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#71717a]">
                        <Clock className="h-2.5 w-2.5" />
                        {step.tip}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
