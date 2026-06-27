'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ListChecks, Lightbulb, BarChart3, Copy, Check, Sparkles } from 'lucide-react';

function buildContentForTab(
  key: string,
  result: any,
  drafts: any[],
): string | null {
  // If API returned explicit content for this type, use it
  if (result?.preparedContent?.type === key && result?.preparedContent?.content) {
    return result.preparedContent.content;
  }

  // Fallback: build content from plan data
  if (!result) {
    // Fall back to local drafts
    if (key === 'draft' && drafts.length > 0) return drafts[drafts.length - 1].content;
    return null;
  }

  switch (key) {
    case 'draft':
      // Try to use any prepared content as draft fallback
      if (result.preparedContent?.content) return result.preparedContent.content;
      if (drafts.length > 0) return drafts[drafts.length - 1].content;
      return null;

    case 'checklist':
      // Build from recommendations
      if (result.recommendations?.length) {
        return result.recommendations.map((r: string, i: number) =>
          `${i + 1}. ${r}`
        ).join('\n');
      }
      return null;

    case 'strategy':
      // Build strategy from schedule + focus
      if (result.schedule?.length || result.focusTask) {
        const lines: string[] = ['## Execution Strategy', ''];
        if (result.focusTask) lines.push(`Focus: ${result.focusTask}`);
        lines.push('');
        if (result.schedule?.length) {
          lines.push('Timeline:');
          result.schedule.forEach((s: any) => {
            lines.push(`  ${s.start}-${s.end} → ${s.task}`);
          });
        }
        if (result.recommendations?.length) {
          lines.push('', 'Recommendations:');
          result.recommendations.forEach((r: string) => lines.push(`  • ${r}`));
        }
        return lines.join('\n');
      }
      return null;

    case 'analysis':
      {
        const lines = [
          '═══ AI ANALYSIS ═══',
          '',
          `Panic Score: ${result.panicScore}/10`,
          `Priority: ${result.priority}`,
          `Reason: ${result.reason}`,
          `Focus: ${result.focusTask}`,
          '',
          '── Tasks ──',
        ];
        if (result.tasks?.length) {
          result.tasks.forEach((t: any) => {
            lines.push(`  • ${t.title}`);
            lines.push(`    Priority: ${t.priority} | Effort: ~${t.estimatedEffort}`);
            if (t.aiSuggestion) lines.push(`    Tip: ${t.aiSuggestion}`);
            lines.push('');
          });
        }
        if (result.atomicSteps?.length) {
          lines.push('── Atomic Steps ──');
          result.atomicSteps.forEach((s: any, i: number) => {
            lines.push(`  ${i + 1}. ${s.title} (${s.duration})`);
          });
          lines.push('');
        }
        if (result.recommendations?.length) {
          lines.push('── Recommendations ──');
          result.recommendations.forEach((r: string) => lines.push(`  • ${r}`));
        }
        return lines.join('\n');
      }

    default:
      return null;
  }
}

const tabs: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: 'draft', icon: <FileText className="h-3.5 w-3.5" />, label: 'Draft' },
  { key: 'checklist', icon: <ListChecks className="h-3.5 w-3.5" />, label: 'Checklist' },
  { key: 'strategy', icon: <Lightbulb className="h-3.5 w-3.5" />, label: 'Strategy' },
  { key: 'analysis', icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Analysis' },
];

export function PreparedForYou() {
  const aiPlanResult = useLMLSStore((s) => s.aiPlanResult);
  const drafts = useLMLSStore((s) => s.drafts);
  const focusTask = useLMLSStore((s) => s.currentFocus);
  const tasks = useLMLSStore((s) => s.tasks);
  const [activeTab, setActiveTab] = useState('analysis');
  const [copied, setCopied] = useState(false);

  const hasAnyContent = tabs.some((t) => buildContentForTab(t.key, aiPlanResult, drafts) !== null);

  if (!hasAnyContent && drafts.length === 0 && tasks.filter((t) => t.status !== 'completed').length === 0) {
    return (
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#71717a]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Prepared For You
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="mb-2 h-8 w-8 text-[#71717a]" />
          <p className="text-sm text-[#71717a]">No content prepared yet.</p>
          <p className="text-xs text-[#71717a]">Add tasks and LMLS will prepare drafts, checklists, and strategy for you.</p>
        </div>
      </div>
    );
  }

  const currentContent = buildContentForTab(activeTab, aiPlanResult, drafts);

  const handleCopy = async () => {
    if (!currentContent) return;
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = currentContent;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#A78BFA]" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Prepared For You
          </h2>
        </div>
        {focusTask && (
          <span className="max-w-[140px] truncate text-[10px] text-[#71717a]">
            for {focusTask}
          </span>
        )}
      </div>

      <div className="mb-3 flex gap-1 rounded-lg bg-white/[0.03] p-1">
        {tabs.map((tab) => {
          const hasContent = buildContentForTab(tab.key, aiPlanResult, drafts) !== null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[9px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/[0.05] text-white'
                  : hasContent
                    ? 'text-[#a1a1aa] hover:text-[#ffffff]/90'
                    : 'text-zinc-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {currentContent ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#71717a]">
                  {activeTab}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded p-1 text-[#71717a] transition-colors hover:bg-white/[0.05] hover:text-[#ffffff]/90"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#00E599]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="max-h-[240px] overflow-y-auto rounded-lg bg-black/30 p-3">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#ffffff]/90">
                  {currentContent}
                </pre>
              </div>

              <p className="mt-2 text-[9px] text-[#71717a]">
                AI-generated — review and customize before use.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-[#71717a]">
                No {activeTab} content prepared.
              </p>
              <p className="text-[10px] text-[#71717a]">
                Regenerate the plan to include this.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
