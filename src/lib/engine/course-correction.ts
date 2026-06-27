import { Task, ScheduleBlock, CourseCorrectionPlan } from './types';

export function generateCourseCorrection(
  tasks: Task[],
  originalSchedule: ScheduleBlock[],
  timeRemainingHours: number,
): CourseCorrectionPlan {
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const pa = a.priority === 'critical' ? 0 : a.priority === 'important' ? 1 : 2;
      const pb = b.priority === 'critical' ? 0 : b.priority === 'important' ? 1 : 2;
      return pa - pb;
    });

  let availableMinutes = timeRemainingHours * 60;
  const keptTaskIds: string[] = [];
  const removedTasks: string[] = [];
  const deprioritizedTasks: string[] = [];

  for (const task of sortedTasks) {
    const needed = task.estimatedHours * 60;
    if (needed <= availableMinutes) {
      keptTaskIds.push(task.id);
      availableMinutes -= needed;
    } else if (task.priority === 'critical') {
      deprioritizedTasks.push(task.title);
      keptTaskIds.push(task.id);
      availableMinutes = 0;
    } else {
      removedTasks.push(task.title);
    }
  }

  const correctedSchedule = originalSchedule.filter(
    (block) => !block.taskId || keptTaskIds.includes(block.taskId),
  );

  const remaining = correctedSchedule.filter(
    (b) => b.start > new Date(),
  );

  const totalOriginalMinutes = originalSchedule
    .filter((b) => b.type !== 'break')
    .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60000, 0);

  const totalCorrectedMinutes = remaining
    .filter((b) => b.type !== 'break')
    .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60000, 0);

  const reductionPercent = Math.round(
    (1 - totalCorrectedMinutes / Math.max(totalOriginalMinutes, 1)) * 100,
  );

  const minDeliverable =
    keptTaskIds.length > 0
      ? `Complete: ${tasks.filter((t) => keptTaskIds.includes(t.id)).map((t) => t.title).join(', ')}`
      : 'Focus on highest-priority item only';

  return {
    originalSchedule,
    correctedSchedule,
    removedTasks,
    deprioritizedTasks,
    recoveryTimeline: reductionPercent > 0
      ? `Reduced workload by ~${reductionPercent}%. Rebuilt schedule with ${remaining.length} blocks.`
      : 'Schedule intact. Proceed as planned.',
    minimumDeliverable: minDeliverable,
  };
}
