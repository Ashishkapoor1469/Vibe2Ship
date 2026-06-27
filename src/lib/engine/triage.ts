import { Task, PanicScore } from './types';

export function calculatePanicScore(task: Task): PanicScore {
  let score = 0;
  const reasons: string[] = [];

  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;

  if (deadline) {
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft < 2) {
      score += 4;
      reasons.push('Deadline in under 2 hours');
    } else if (hoursLeft < 24) {
      score += 3;
      reasons.push('Deadline within 24 hours');
    } else if (hoursLeft < 72) {
      score += 2;
      reasons.push('Deadline within 3 days');
    } else {
      score += 1;
      reasons.push('Deadline more than 3 days away');
    }
  } else {
    score += 1;
    reasons.push('No fixed deadline');
  }

  const effort = task.estimatedHours;
  if (effort >= 8) {
    score += 3;
    reasons.push('Large project');
  } else if (effort >= 3) {
    score += 2;
    reasons.push('Medium task');
  } else {
    score += 1;
    reasons.push('Small task');
  }

  if (task.progress <= 10) {
    score += 3;
    reasons.push('Not started');
  } else if (task.progress < 70) {
    score += 1;
    reasons.push('Partially done');
  }

  const finalScore = Math.min(score, 10);
  const reason = reasons.join('; ');

  return { score: finalScore, reason };
}

export function classifyPriority(task: Task): Task['priority'] {
  const panic = calculatePanicScore(task);
  if (panic.score >= 7) return 'critical';
  if (panic.score >= 4) return 'important';
  if (panic.score >= 2) return 'normal';
  return 'low';
}

export function triageTasks(tasks: Task[]): {
  critical: Task[];
  important: Task[];
  normal: Task[];
  low: Task[];
} {
  const classified = tasks.map((t) => ({
    ...t,
    priority: classifyPriority(t),
  }));

  return {
    critical: classified.filter((t) => t.priority === 'critical'),
    important: classified.filter((t) => t.priority === 'important'),
    normal: classified.filter((t) => t.priority === 'normal'),
    low: classified.filter((t) => t.priority === 'low'),
  };
}

export function getHighestPriorityTask(tasks: Task[]): Task | null {
  const triaged = triageTasks(tasks);
  const allPriority = [
    ...triaged.critical,
    ...triaged.important,
    ...triaged.normal,
    ...triaged.low,
  ];
  return allPriority[0] ?? null;
}
