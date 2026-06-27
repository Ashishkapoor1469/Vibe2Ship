'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';
import { TaskCategory } from '@/lib/engine/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Gauge, Clock, Target, Layers, Brain } from 'lucide-react';

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'deep-work', label: 'Deep Work' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'creative', label: 'Creative' },
  { value: 'review', label: 'Review' },
];

export function TaskIntelligence() {
  const addTask = useLMLSStore((s) => s.addTask);

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [category, setCategory] = useState<TaskCategory>('deep-work');
  const [progress, setProgress] = useState('0');

  const [urgencyPreview, setUrgencyPreview] = useState<{
    score: number;
    level: string;
    color: string;
  } | null>(null);

  const handleInputChange = (val: string) => {
    setTitle(val);
    if (val.trim()) {
      const deadlineDate = deadline ? new Date(deadline) : null;
      const hours = parseFloat(estimatedHours) || 1;
      const prog = parseInt(progress) || 0;

      let score = 0;
      if (deadlineDate) {
        const hLeft = (deadlineDate.getTime() - Date.now()) / 3600000;
        if (hLeft < 2) score += 40;
        else if (hLeft < 24) score += 30;
        else if (hLeft < 72) score += 20;
        else score += 10;
      }
      if (hours >= 8) score += 30;
      else if (hours >= 3) score += 20;
      else score += 10;
      if (prog <= 10) score += 30;
      else if (prog < 50) score += 15;

      score = Math.min(score, 100);

      const level = score >= 70 ? 'Critical' : score >= 40 ? 'Important' : 'Normal';
      const color = score >= 70 ? 'text-red-400' : score >= 40 ? 'text-[#FBBF24]' : 'text-[#a1a1aa]';

      setUrgencyPreview({ score, level, color });
    } else {
      setUrgencyPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      deadline: deadline ? new Date(deadline) : undefined,
      estimatedHours: parseFloat(estimatedHours) || 1,
      category,
      progress: parseInt(progress) || 0,
      priority: 'normal',
      description: undefined,
      tags: undefined,
      links: undefined,
    });

    setTitle('');
    setDeadline('');
    setEstimatedHours('1');
    setProgress('0');
    setUrgencyPreview(null);
    setExpanded(false);
  };

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#A78BFA]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Task Intelligence
          </h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-[#71717a] hover:text-[#ffffff]/90"
        >
          <Plus className="h-3 w-3" />
          Add Task
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="What needs to be done?"
                  className="w-full rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-[#ffffff] placeholder-[#71717a] outline-none ring-1 ring-[#27272a] transition-all focus:ring-[#00E599]/30"
            />
            {title.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Gauge className={`h-4 w-4 ${urgencyPreview?.color ?? 'text-[#71717a]'}`} />
              </motion.div>
            )}
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="shrink-0 rounded-lg bg-white/[0.05] px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-30"
          >
            Add
          </button>
        </div>

        {urgencyPreview && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-1.5"
          >
            <Target className={`h-3 w-3 ${urgencyPreview.color}`} />
            <span className={`text-[10px] font-medium ${urgencyPreview.color}`}>
              Urgency: {urgencyPreview.level} ({urgencyPreview.score}/100)
            </span>
            <div className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.03]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${urgencyPreview.score}%` }}
                className={`h-full rounded-full ${
                  urgencyPreview.score >= 70 ? 'bg-red-400' : urgencyPreview.score >= 40 ? 'bg-[#FBBF24]' : 'bg-[#a1a1aa]'
                }`}
              />
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-[#71717a]">
                    <Clock className="mr-1 inline h-2.5 w-2.5" />
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (title.trim()) handleInputChange(title);
                    }}
                    className="w-full rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-[#71717a]">
                    <Layers className="mr-1 inline h-2.5 w-2.5" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#121214]">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-[#71717a]">
                    Effort (hours)
                  </label>
                  <input
                    type="number"
                    min="0.25"
                    max="40"
                    step="0.25"
                    value={estimatedHours}
                    onChange={(e) => {
                      setEstimatedHours(e.target.value);
                      if (title.trim()) handleInputChange(title);
                    }}
                    className="w-full rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-[#71717a]">
                    Progress %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => {
                      setProgress(e.target.value);
                      if (title.trim()) handleInputChange(title);
                    }}
                    className="w-full rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none ring-1 ring-[#27272a] focus:ring-[#00E599]/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-[#71717a] hover:text-[#ffffff]/90"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Less' : 'More details'}
          </button>
        </div>
      </form>
    </div>
  );
}
