'use client';

import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertTriangle, Leaf, Shield, Clock, CheckCircle, Trash2, Zap, Brain, Loader2 } from 'lucide-react';

const priorityMap = {
  critical: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' },
  important: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Important' },
  normal: { icon: Leaf, color: 'text-[#a1a1aa]', bg: 'bg-white/[0.05]', label: 'Normal' },
  low: { icon: Shield, color: 'text-[#71717a]', bg: 'bg-zinc-500/10', label: 'Low' },
};

export function SmartTaskCards() {
  const tasks = useLMLSStore((s) => s.tasks);
  const updateTask = useLMLSStore((s) => s.updateTask);
  const removeTask = useLMLSStore((s) => s.removeTask);
  const completeTask = useLMLSStore((s) => s.completeTask);
  const aiPlanResult = useLMLSStore((s) => s.aiPlanResult);
  const selectedTaskId = useLMLSStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useLMLSStore((s) => s.setSelectedTaskId);
  const isGenerating = useLMLSStore((s) => s.isGenerating);
  const analysisInProgress = useLMLSStore((s) => s.analysisInProgress);

  const active = tasks.filter((t) => t.status !== 'completed');

  if (tasks.length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Active Tasks
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/5">
            <Brain className="h-6 w-6 text-zinc-600" />
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
          <Zap className="h-4 w-4 text-[#00E599]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Active Tasks
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E599]/10">
            <CheckCircle className="h-6 w-6 text-[#00E599]" />
          </div>
          <p className="text-sm font-medium text-[#00E599]">All done!</p>
          <p className="text-xs text-zinc-600">{tasks.length} task{tasks.length !== 1 ? 's' : ''} completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#FBBF24]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Active Tasks
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {(isGenerating || analysisInProgress) && (
            <div className="flex items-center gap-1 text-[10px] text-[#A78BFA]">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI...
            </div>
          )}
          <span className="text-[10px] text-[#71717a]">{active.length} task{active.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {active.map((task) => {
            const pConfig = priorityMap[task.priority] ?? priorityMap.normal;
            const PriorityIcon = pConfig.icon;
            const deadlineStr = task.deadline ? getDeadlineDisplay(new Date(task.deadline)) : null;
            const isOverdue = task.deadline && new Date(task.deadline) < new Date();
            const isSelected = selectedTaskId === task.id;

            const aiSuggestion = aiPlanResult?.tasks?.find(
              (t) => t.title.toLowerCase() === task.title.toLowerCase()
            )?.aiSuggestion;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setSelectedTaskId(task.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#00E599]/40 bg-[#00E599]/5 shadow-[0_0_16px_rgba(0,229,153,0.08)]'
                    : 'border-white/5 bg-white/[0.02] hover:border-[#00E599]/20'
                } ${(isGenerating || analysisInProgress) ? 'opacity-70' : ''}`}
              >
                {(isGenerating || analysisInProgress) && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
                <div className={`priority-line ${
                  task.priority === 'critical' ? 'bg-red-500' :
                  task.priority === 'important' ? 'bg-amber-400' :
                  task.priority === 'normal' ? 'bg-zinc-400' :
                  'bg-zinc-600'
                }`} />
                <div className="p-3 pl-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{task.title}</span>
                        <span className={`flex items-center gap-1 rounded-full ${pConfig.bg} px-2 py-0.5`}>
                          <PriorityIcon className={`h-2.5 w-2.5 ${pConfig.color}`} />
                          <span className={`text-[9px] font-medium ${pConfig.color}`}>{pConfig.label}</span>
                        </span>
                        {isOverdue && (
                          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-400">Overdue</span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[#71717a]">
                        {deadlineStr && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                            <Clock className="h-3 w-3" />
                            Due {deadlineStr}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          ~{task.estimatedHours}h
                        </span>
                        <span className="text-zinc-600">{task.category.replace('-', ' ')}</span>
                      </div>

                      {task.aiAnalysis && (
                        <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-[#00E599]/5 px-2 py-1">
                          <Brain className="h-3 w-3 text-[#00E599]" />
                          <span className="text-[10px] text-[#00E599]">AI: {task.aiAnalysis.reasoning}</span>
                        </div>
                      )}

                      {aiSuggestion && (
                        <div className="mt-1.5 text-[10px] italic text-[#71717a]">💡 {aiSuggestion}</div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                        className="rounded p-1 text-[#71717a] hover:bg-[#00E599]/10 hover:text-[#00E599]"
                        title="Complete"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                        className="rounded p-1 text-[#71717a] hover:bg-red-500/10 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[9px] text-zinc-600">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="mt-0.5 h-1 overflow-hidden rounded-full progress-track">
                      <motion.div
                        className="h-full rounded-full progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getDeadlineDisplay(date: Date): string {
  const now = Date.now();
  const ms = date.getTime() - now;
  const hours = Math.floor(ms / 3600000);
  if (hours < 0) return 'Overdue';
  if (hours < 1) return 'in <1h';
  if (hours < 24) return `in ${hours}h`;
  if (hours < 48) return 'tomorrow';
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}
