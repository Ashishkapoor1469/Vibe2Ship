import Dexie, { Table } from 'dexie';
import { Task, Draft, UserProfile } from '../engine/types';

export class LMLSDatabase extends Dexie {
  tasks!: Table<Task, string>;
  drafts!: Table<Draft, string>;
  userProfile!: Table<UserProfile, string>;

  constructor() {
    super('LMLS_DB');
    this.version(1).stores({
      tasks: 'id, priority, deadline, createdAt',
      drafts: 'id, taskId, type, createdAt',
      userProfile: '&energyProfile',
    });
  }
}

export const db = new LMLSDatabase();

// Local-first helpers
export async function saveTasks(tasks: Task[]): Promise<void> {
  await db.tasks.clear();
  if (tasks.length > 0) await db.tasks.bulkPut(tasks);
}

export async function loadTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}

export async function saveDrafts(drafts: Draft[]): Promise<void> {
  await db.drafts.bulkPut(drafts);
}

export async function loadDrafts(): Promise<Draft[]> {
  return db.drafts.toArray();
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await db.userProfile.put(profile, profile.energyProfile);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const profiles = await db.userProfile.toArray();
  return profiles[0] ?? null;
}

export async function clearAll(): Promise<void> {
  await db.tasks.clear();
  await db.drafts.clear();
  await db.userProfile.clear();
}
