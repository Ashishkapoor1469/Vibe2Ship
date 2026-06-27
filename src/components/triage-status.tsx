'use client';

import { useLMLSStore } from '@/lib/store';

export function TriageStatus() {
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const panicScore = useLMLSStore((s) => s.panicScore);
  const tasks = useLMLSStore((s) => s.tasks);

  if (!currentFocus) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="h-2 w-2 rounded-full bg-zinc-300" />
          No active tasks. Add one to start triage.
        </div>
      </div>
    );
  }

  const score = panicScore?.score ?? 0;
  const isCritical = score >= 7;

  return (
    <div
      className={`rounded-lg border p-4 ${
        isCritical
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Current Triage Status
        </h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            isCritical
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 panic-critical'
              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          {isCritical && '🚨 '}
          Panic: {score}/10
        </span>
      </div>

      <div className="mb-3">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
          {currentFocus}
        </div>
        {panicScore && (
          <div className="mt-1 text-xs text-zinc-500">{panicScore.reason}</div>
        )}
      </div>

      <div className="flex gap-2">
        {(['critical', 'important', 'normal', 'low'] as const).map((level) => {
          const count = tasks.filter((t) => t.priority === level).length;
          return (
            <div key={level} className="flex items-center gap-1 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  level === 'critical'
                    ? 'bg-red-500'
                    : level === 'important'
                      ? 'bg-amber-500'
                      : level === 'normal'
                        ? 'bg-zinc-400'
                        : 'bg-zinc-400'
                }`}
              />
              <span className="text-zinc-500 dark:text-zinc-400">
                {count} {level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
