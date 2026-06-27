import { UserProfile, ScheduleBlock, Task, EnergyProfile } from './types';

export function generateSchedule(
  tasks: Task[],
  profile: UserProfile,
  startHour: number = 8,
  endHour: number = 22,
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  const now = new Date();
  let currentTime = new Date(now);
  currentTime.setHours(startHour, 0, 0, 0);

  if (currentTime <= now) {
    currentTime = new Date(now);
    currentTime.setMinutes(currentTime.getMinutes() + 5, 0, 0);
  }

  const workEnd = new Date(now);
  workEnd.setHours(endHour, 0, 0, 0);

  const deepWorkTime = getDeepWorkTime(profile.energyProfile);
  const frictionTimes = profile.frictionTimes.map((t) => {
    const [h] = t.replace(/\s*[ap]m/i, '').split(':').map(Number);
    return h;
  });

  const sorted = [...tasks].sort((a, b) => {
    const pa = a.priority === 'critical' ? 0 : a.priority === 'important' ? 1 : 2;
    const pb = b.priority === 'critical' ? 0 : b.priority === 'important' ? 1 : 2;
    return pa - pb;
  });

  let taskIndex = 0;

  while (currentTime < workEnd && taskIndex < sorted.length) {
    const task = sorted[taskIndex];
    const taskMinutes = Math.min(task.estimatedHours * 60, 120);
    const isDeep = task.category === 'deep-work';

    const currentHour = currentTime.getHours();
    const isFriction = frictionTimes.includes(currentHour);

    if (isFriction) {
      const blockEnd = new Date(currentTime);
      blockEnd.setHours(currentHour + 1, 0, 0, 0);

      blocks.push({
        start: new Date(currentTime),
        end: blockEnd,
        type: 'maintenance',
        title: 'Light maintenance (low-energy block)',
      });

      currentTime = blockEnd;
      continue;
    }

    if (isDeep && currentHour >= deepWorkTime[0] && currentHour < deepWorkTime[1]) {
      const blockEnd = new Date(
        currentTime.getTime() + Math.min(taskMinutes, 50) * 60 * 1000,
      );

      blocks.push({
        start: new Date(currentTime),
        end: blockEnd,
        type: 'deep-work',
        taskId: task.id,
        title: `Deep Work: ${task.title}`,
      });

      currentTime = blockEnd;

      const breakEnd = new Date(currentTime.getTime() + 10 * 60 * 1000);
      blocks.push({
        start: new Date(currentTime),
        end: breakEnd,
        type: 'break',
        title: 'Recovery break',
      });
      currentTime = breakEnd;
    } else {
      const blockEnd = new Date(
        currentTime.getTime() + Math.min(taskMinutes, 25) * 60 * 1000,
      );

      blocks.push({
        start: new Date(currentTime),
        end: blockEnd,
        type: 'maintenance',
        taskId: task.id,
        title: `${task.title}`,
      });

      currentTime = blockEnd;

      const breakEnd = new Date(currentTime.getTime() + 5 * 60 * 1000);
      blocks.push({
        start: new Date(currentTime),
        end: breakEnd,
        type: 'break',
        title: 'Quick reset',
      });
      currentTime = breakEnd;
    }

    const bufferEnd = new Date(currentTime.getTime() + 10 * 60 * 1000);
    blocks.push({
      start: new Date(currentTime),
      end: bufferEnd,
      type: 'buffer',
      title: 'Buffer / overflow',
    });
    currentTime = bufferEnd;

    taskIndex++;
  }

  return blocks;
}

function getDeepWorkTime(profile: EnergyProfile): [number, number] {
  const map: Record<string, [number, number]> = {
    'morning-lark': [6, 12],
    'afternoon-bear': [10, 14],
    'night-owl': [20, 24],
  };
  return map[profile] ?? [8, 12];
}

export function injectRecoveryBlocks(
  schedule: ScheduleBlock[],
): ScheduleBlock[] {
  const result: ScheduleBlock[] = [];

  for (let i = 0; i < schedule.length; i++) {
    result.push(schedule[i]);

    if (
      schedule[i].type === 'deep-work' &&
      i + 1 < schedule.length &&
      schedule[i + 1].type !== 'break'
    ) {
      const recoveryEnd = new Date(
        schedule[i].end.getTime() + 20 * 60 * 1000,
      );
      result.push({
        start: new Date(schedule[i].end),
        end: recoveryEnd,
        type: 'break',
        title: 'Recovery window (post-deep-work)',
      });
    }
  }

  return result;
}
