'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';

export function DraftViewer() {
  const drafts = useLMLSStore((s) => s.drafts);
  const [activeIndex, setActiveIndex] = useState(0);

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">
          No drafts yet. Generate a plan to get started.
        </p>
      </div>
    );
  }

  const active = drafts[activeIndex] ?? drafts[0];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Prepared For You
        </h2>
        {drafts.length > 1 && (
          <div className="flex gap-1">
            {drafts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-zinc-800 dark:bg-zinc-200' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {active.type}
        </span>
      </div>

      <pre className="max-h-[300px] overflow-y-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {active.content}
      </pre>

      <p className="mt-2 text-[10px] text-zinc-400">
        Edit this draft to make it your own — momentum beats perfection.
      </p>
    </div>
  );
}
