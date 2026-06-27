'use client';

import { useLMLSStore } from '@/lib/store';
import { BookOpen, ExternalLink, Wrench, Paperclip, Zap } from 'lucide-react';

export function ResourcesCard() {
  const aiPlanResult = useLMLSStore((s) => s.aiPlanResult);
  const tasks = useLMLSStore((s) => s.tasks);

  const hasResources =
    aiPlanResult?.preparedContent?.type === 'resources' ||
    aiPlanResult?.preparedContent?.type === 'code';

  const activeCount = tasks.filter((t) => t.status !== 'completed').length;

  if (!hasResources && activeCount === 0) return null;

  const resourceContent = hasResources
    ? aiPlanResult!.preparedContent.content
    : null;

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[#A78BFA]" />
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
          Resources
        </h2>
      </div>

      {resourceContent ? (
        <div className="max-h-[180px] overflow-y-auto rounded-lg bg-black/30 p-3">
          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#ffffff]/90">
            {resourceContent}
          </pre>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-[#71717a]">
            {activeCount > 0
              ? `${activeCount} task${activeCount > 1 ? 's' : ''} in progress.`
              : 'No active tasks.'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2">
              <ExternalLink className="h-3 w-3 text-[#71717a]" />
              <span className="text-[10px] text-[#a1a1aa]">References</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2">
              <Wrench className="h-3 w-3 text-[#71717a]" />
              <span className="text-[10px] text-[#a1a1aa]">Tools</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2">
              <Paperclip className="h-3 w-3 text-[#71717a]" />
              <span className="text-[10px] text-[#a1a1aa]">Attachments</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#00E599]/10 px-2.5 py-2">
              <Zap className="h-3 w-3 text-[#00E599]" />
              <span className="text-[10px] text-[#00E599]">+{activeCount} active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
