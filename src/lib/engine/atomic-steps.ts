import { v4 as uuidv4 } from 'uuid';
import { Task, AtomicStep } from './types';

export function generateAtomicSteps(task: Task): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const totalMinutes = Math.max(task.estimatedHours * 60, 15);

  const chunkSize = 15;
  const numChunks = Math.ceil(totalMinutes / chunkSize);

  const prefix = generateStepPrefix(task.category);
  const remaining = task.estimatedHours * 60;

  for (let i = 0; i < numChunks; i++) {
    const stepMinutes = Math.min(chunkSize, remaining - i * chunkSize);
    if (stepMinutes <= 0) break;

    const stepNumber = i + 1;
    const verbs = pickVerbs(task.category, i, numChunks);

    steps.push({
      id: uuidv4(),
      title: `${verbs.action} ${task.title} — ${verbs.subtask}`,
      estimatedMinutes: stepMinutes,
      goal: verbs.goal,
      tip: pickTip(task.category, i),
      taskId: task.id,
      completed: false,
      status: i === 0 ? 'ready' : 'locked',
    });
  }

  return steps;
}

function generateStepPrefix(category: string): string {
  const map: Record<string, string> = {
    'deep-work': 'Deep Work',
    maintenance: 'Maintenance',
    creative: 'Creative',
    review: 'Review',
  };
  return map[category] ?? 'Task';
}

function pickVerbs(
  category: string,
  index: number,
  total: number,
): { action: string; subtask: string; goal: string } {
  if (index === 0) {
    return {
      action: 'Open & set up',
      subtask: 'gather materials, open environment',
      goal: 'Eliminate start friction',
    };
  }

  if (index === total - 1) {
    return {
      action: 'Polish & finish',
      subtask: 'review, finalize, submit',
      goal: 'Cross the finish line',
    };
  }

  const midActions: Record<string, { action: string; subtask: string; goal: string }> = {
    'deep-work': {
      action: 'Build',
      subtask: 'core logic or component',
      goal: 'Make substantial progress',
    },
    maintenance: {
      action: 'Tidy',
      subtask: 'organize, clean up, sort',
      goal: 'Reduce clutter',
    },
    creative: {
      action: 'Draft',
      subtask: 'write, design, outline',
      goal: 'Get ideas on paper',
    },
    review: {
      action: 'Audit',
      subtask: 'check, test, validate',
      goal: 'Ensure quality',
    },
  };

  return (
    midActions[category] ?? {
      action: 'Work on',
      subtask: 'next logical piece',
      goal: 'Maintain momentum',
    }
  );
}

function pickTip(category: string, index: number): string {
  if (index === 0) return 'Just start — momentum beats perfection';
  if (index % 3 === 2) return 'Take a 2-min stretch break after this';
  return '';
}
