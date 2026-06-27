// Cloud sync manager — local-first architecture
// Syncs IndexedDB to remote when available, never loses local data

export interface SyncPayload {
  tasks: unknown[];
  drafts: unknown[];
  profile: unknown;
  lastSyncedAt: string;
}

export interface SyncProvider {
  push(payload: SyncPayload): Promise<void>;
  pull(): Promise<SyncPayload | null>;
}

export class SyncManager {
  private provider: SyncProvider | null = null;
  private lastSync: Date | null = null;
  private syncInProgress = false;

  constructor(provider?: SyncProvider) {
    if (provider) this.provider = provider;
  }

  setProvider(provider: SyncProvider): void {
    this.provider = provider;
  }

  async sync(): Promise<{ pushed: boolean; pulled: boolean; error?: string }> {
    if (!this.provider || this.syncInProgress) {
      return { pushed: false, pulled: false };
    }

    this.syncInProgress = true;

    try {
      const { loadTasks, loadDrafts, loadProfile } = await import('../store/db');
      const tasks = await loadTasks();
      const drafts = await loadDrafts();
      const profile = await loadProfile();

      const payload: SyncPayload = {
        tasks,
        drafts,
        profile,
        lastSyncedAt: new Date().toISOString(),
      };

      // Push local changes
      await this.provider.push(payload);
      this.lastSync = new Date();

      // Pull remote changes
      const remote = await this.provider.pull();
      let pulled = false;

      if (remote && remote.lastSyncedAt > (this.lastSync?.toISOString() ?? '')) {
        const { saveTasks, saveDrafts, saveProfile } = await import('../store/db');
        await saveTasks(remote.tasks as any);
        await saveDrafts(remote.drafts as any);
        if (remote.profile) await saveProfile(remote.profile as any);
        pulled = true;
      }

      return { pushed: true, pulled };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      return { pushed: false, pulled: false, error: message };
    } finally {
      this.syncInProgress = false;
    }
  }

  getLastSync(): Date | null {
    return this.lastSync;
  }
}

export const syncManager = new SyncManager();

// Example: Supabase provider — implement when Supabase credentials are configured
export function createSupabaseProvider(url: string, key: string): SyncProvider {
  return {
    async push(_payload: SyncPayload): Promise<void> {
      // TODO: implement Supabase push
      // await supabase.from('sync').upsert(payload);
    },
    async pull(): Promise<SyncPayload | null> {
      // TODO: implement Supabase pull
      // return supabase.from('sync').select('*').single();
      return null;
    },
  };
}
