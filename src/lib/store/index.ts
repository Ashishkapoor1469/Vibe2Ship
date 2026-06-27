'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  PanicScore,
  AtomicStep,
  ScheduleBlock,
  Draft,
  UserProfile,
  CourseCorrectionPlan,
  EnergyLevel,
  AIPlanResult,
  ChatMessage,
  ProductivityMemory,
  AiAnalysis,
  TaskMemory,
  TaskCategory,
  PlanStatus,
} from '../engine/types';
import { calculatePanicScore as calcPanicForTask, getHighestPriorityTask } from '../engine/triage';
import { generateAtomicSteps } from '../engine/atomic-steps';
import { generateSchedule } from '../engine/scheduler';
import { generateDraft } from '../engine/draft-generator';
import { generateCourseCorrection } from '../engine/course-correction';
import { saveTasks, loadTasks, saveDrafts, loadDrafts, saveProfile, loadProfile } from './db';

const LS_KEY = 'lmls_tasks';
const PLAN_KEY = 'lmls_plan';
const SELECTED_KEY = 'lmls_selected';

const defaultMemory: ProductivityMemory = {
  completedTasks: [],
  missedDeadlines: 0,
  averageCompletionRate: 0,
  difficultCategories: [],
  averageOverestimation: 20,
  totalTasksCompleted: 0,
};

function getActive(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'completed');
}

interface LMLSStore {
  tasks: Task[];
  currentFocus: string | null;
  panicScore: PanicScore | null;
  atomicSteps: AtomicStep[];
  schedule: ScheduleBlock[];
  drafts: Draft[];
  userProfile: UserProfile | null;
  onboardingComplete: boolean;
  courseCorrectionPlan: CourseCorrectionPlan | null;
  energyLevel: EnergyLevel;
  aiPlanResult: AIPlanResult | null;
  planDraft: AIPlanResult | null;
  planStatus: PlanStatus;
  isGenerating: boolean;
  generateProgress: string;
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  recoveryMode: boolean;
  memory: ProductivityMemory;
  analysisInProgress: boolean;
  selectedTaskId: string | null;
  toastMessage: string | null;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  completeTask: (id: string) => void;
  setProfile: (profile: UserProfile) => Promise<void>;
  runTriage: () => void;
  generatePlan: () => Promise<void>;
  generatePlanWithAI: () => Promise<void>;
  setPlanDraft: (draft: AIPlanResult | null) => void;
  confirmPlan: () => void;
  cancelPlan: () => void;
  setPlanStatus: (status: PlanStatus) => void;
  toggleAtomicStep: (stepId: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setToastMessage: (msg: string | null) => void;
  triggerCourseCorrection: (timeRemainingHours: number) => void;
  pivot: () => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  setChatOpen: (open: boolean) => void;
  addChatMessage: (role: ChatMessage['role'], content: string) => void;
  clearChat: () => void;
  setRecoveryMode: (mode: boolean) => void;
  setAIPlanResult: (result: AIPlanResult | null) => void;
  loadFromDB: () => Promise<void>;
  analyzeTaskWithAI: (title: string, description?: string, deadline?: string) => Promise<AiAnalysis | null>;
  generateBattlePlan: () => void;
}

export const useLMLSStore = create<LMLSStore>((set, get) => ({
  tasks: [],
  currentFocus: null,
  panicScore: null,
  atomicSteps: [],
  schedule: [],
  drafts: [],
  userProfile: null,
  onboardingComplete: false,
  courseCorrectionPlan: null,
  energyLevel: 'normal',
  aiPlanResult: null,
  planDraft: null,
  planStatus: null,
  isGenerating: false,
  generateProgress: '',
  chatMessages: [],
  chatOpen: false,
  recoveryMode: false,
  memory: defaultMemory,
  analysisInProgress: false,
  selectedTaskId: null,
  toastMessage: null,

  addTask: async (taskData) => {
    const urgencyScore = calculateUrgency(taskData);
    const task: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      urgencyScore,
      status: 'pending',
    };
    const tasks = [...get().tasks, task];
    set({ tasks });
    await saveTasks(tasks);
    persistToLocal(tasks);
    get().runTriage();
    get().generateBattlePlan();
    get().analyzeTaskWithAI(taskData.title, taskData.description, taskData.deadline?.toISOString());

    // Auto-generate AI plan and confirm (skip draft/approval flow)
    await get().generatePlanWithAI();
    if (get().planDraft) {
      get().confirmPlan();
    }
  },

  updateTask: async (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t,
    );
    set({ tasks });
    await saveTasks(tasks);
    persistToLocal(tasks);
    get().runTriage();
    get().generateBattlePlan();
  },

  removeTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await saveTasks(tasks);
    persistToLocal(tasks);
    get().runTriage();
    get().generateBattlePlan();
    await get().generatePlanWithAI();
    if (get().planDraft) {
      get().confirmPlan();
    }
  },

  completeTask: (id) => {
    const { tasks, memory } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const taskMem: TaskMemory = {
      taskId: task.id,
      title: task.title,
      category: task.category,
      estimatedHours: task.estimatedHours,
      completedAt: new Date(),
      missed: false,
      deadline: task.deadline,
    };

    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status: 'completed' as const, progress: 100 } : t,
    );

    const newMemory: ProductivityMemory = {
      ...memory,
      completedTasks: [...memory.completedTasks, taskMem],
      totalTasksCompleted: memory.totalTasksCompleted + 1,
    };

    set({ tasks: updated, memory: newMemory });
    saveTasks(updated);
    persistToLocal(updated);
    get().runTriage();
    get().generateBattlePlan();
    get().generatePlanWithAI().then(() => {
      if (get().planDraft) get().confirmPlan();
    });
  },

  setProfile: async (profile) => {
    set({ userProfile: profile, onboardingComplete: true });
    await saveProfile(profile);
  },

  runTriage: () => {
    const { tasks, memory } = get();
    const active = getActive(tasks);

    if (active.length === 0) {
      set({ currentFocus: null, panicScore: null });
      return;
    }

    let totalScore = 0;
    let reasons: string[] = [];
    let criticalCount = 0;
    let importantCount = 0;

    for (const task of active) {
      const panic = calcPanicForTask(task);
      totalScore += panic.score;
      if (panic.score >= 7) criticalCount++;
      else if (panic.score >= 4) importantCount++;
      if (panic.reason) reasons.push(panic.reason);
    }

    const avgScore = Math.min(Math.round((totalScore / active.length) * 10) / 10, 10);
    const adjustedScore = Math.min(avgScore + (memory.averageOverestimation > 20 ? 0.5 : 0), 10);

    const top = getHighestPriorityTask(active);
    const reasonStr = `${active.length} task${active.length > 1 ? 's' : ''} detected. ${criticalCount} critical, ${importantCount} important. ${reasons[0] ?? ''}`;

    set({
      currentFocus: top?.title ?? active[0].title,
      panicScore: { score: adjustedScore, reason: reasonStr },
    });
  },

  generatePlan: async () => {
    const { tasks, userProfile } = get();
    const active = getActive(tasks);
    const top = getHighestPriorityTask(active);
    if (!top) return;

    const panic = calcPanicForTask(top);
    const steps = generateAtomicSteps(top);
    const schedule = userProfile ? generateSchedule(active, userProfile) : [];
    const draft = generateDraft(top);
    const drafts = [...get().drafts, draft];

    set({
      currentFocus: top.title,
      panicScore: panic,
      atomicSteps: steps,
      schedule,
      drafts,
    });

    await saveDrafts(drafts);
  },

  generatePlanWithAI: async () => {
    const { tasks, energyLevel, userProfile, memory } = get();
    const active = getActive(tasks);
    if (active.length === 0) return;
    set({ isGenerating: true, generateProgress: 'LMLS is analyzing your tasks...' });
    const genStarted = Date.now();

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: active.map((t) => ({
            title: t.title,
            deadline: t.deadline?.toISOString(),
            estimatedHours: t.estimatedHours,
            progress: t.progress,
            category: t.category,
            priority: t.priority,
            status: t.status,
          })),
          availableTime: userProfile?.availableHoursToday ?? 6,
          energyLevel,
          currentTime: new Date().toISOString(),
          memory: {
            averageOverestimation: memory.averageOverestimation,
            difficultCategories: memory.difficultCategories.map((d) => d.category),
          },
        }),
      });

      const data = await res.json();

      if (data.fallback || data.error) {
        set({ generateProgress: 'AI unavailable, using local engine...' });
        await get().generatePlan();

        // Build a planDraft from local data so confirmPlan can run
        const state = get();
        const activeTasks = getActive(state.tasks);
        const panic = state.panicScore;
        const fallbackPlan: AIPlanResult = {
          panicScore: panic?.score ?? 5,
          priority: 'normal',
          reason: panic?.reason ?? `${activeTasks.length} task(s) in queue.`,
          focusTask: state.currentFocus ?? activeTasks[0]?.title ?? '',
          tasks: activeTasks.map((t) => ({
            title: t.title,
            priority: t.priority,
            estimatedEffort: `${t.estimatedHours}h`,
            aiSuggestion: '',
          })),
          atomicSteps: state.atomicSteps.map((s) => ({
            title: s.title,
            duration: `${s.estimatedMinutes} min`,
            reason: s.goal,
            completed: s.completed,
          })),
          schedule: state.schedule.map((s) => ({
            start: s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: s.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            task: s.title,
          })),
          recommendations: ['Focus on the highest priority task first', 'Take breaks every 90 minutes'],
          preparedContent: { type: 'analysis', content: `Local plan for ${activeTasks.length} task(s).` },
        };

        const elapsed = Date.now() - genStarted;
        if (elapsed < 800) await new Promise((r) => setTimeout(r, 800 - elapsed));
        set({ planDraft: fallbackPlan, planStatus: 'draft', isGenerating: false, generateProgress: '' });
        persistPlan(fallbackPlan, 'draft');
        return;
      }

      const plan = data as AIPlanResult;

      const steps: AtomicStep[] = (plan.atomicSteps ?? []).map((s, i) => ({
        id: uuidv4(),
        title: s.title,
        estimatedMinutes: parseInt(s.duration) || 15,
        goal: s.reason,
        tip: '',
        taskId: active[0]?.id ?? '',
        completed: false,
        status: i === 0 ? 'ready' : 'locked' as const,
      }));

      const schedule: ScheduleBlock[] = (plan.schedule ?? []).map((s) => {
        const now = new Date();
        const [sh, sm] = s.start.split(':').map(Number);
        const [eh, em] = s.end.split(':').map(Number);
        const start = new Date(now);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(now);
        end.setHours(eh, em, 0, 0);
        if (end <= start) end.setDate(end.getDate() + 1);
        return {
          start,
          end,
          type: 'deep-work' as const,
          title: s.task,
        };
      });

      const elapsed2 = Date.now() - genStarted;
      if (elapsed2 < 800) await new Promise((r) => setTimeout(r, 800 - elapsed2));

      set({
        planDraft: plan,
        planStatus: 'draft',
        atomicSteps: steps,
        schedule,
        isGenerating: false,
        generateProgress: '',
      });

      persistPlan(plan, 'draft');
    } catch (err) {
      const elapsed3 = Date.now() - genStarted;
      if (elapsed3 < 800) await new Promise((r) => setTimeout(r, 800 - elapsed3));

      set({ generateProgress: 'AI failed, using local fallback...' });
      await get().generatePlan();

      // Build fallback planDraft
      const state = get();
      const activeTasks = getActive(state.tasks);
      const panic = state.panicScore;
      const fallbackPlan2: AIPlanResult = {
        panicScore: panic?.score ?? 5,
        priority: 'normal',
        reason: panic?.reason ?? `${activeTasks.length} task(s) in queue.`,
        focusTask: state.currentFocus ?? activeTasks[0]?.title ?? '',
        tasks: activeTasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          estimatedEffort: `${t.estimatedHours}h`,
          aiSuggestion: '',
        })),
        atomicSteps: state.atomicSteps.map((s) => ({
          title: s.title,
          duration: `${s.estimatedMinutes} min`,
          reason: s.goal,
          completed: s.completed,
        })),
        schedule: state.schedule.map((s) => ({
          start: s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: s.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          task: s.title,
        })),
        recommendations: ['Focus on the highest priority task first', 'Take breaks every 90 minutes'],
        preparedContent: { type: 'analysis', content: `Local plan for ${activeTasks.length} task(s).` },
      };

      set({ planDraft: fallbackPlan2, planStatus: 'draft', isGenerating: false, generateProgress: '' });
      persistPlan(fallbackPlan2, 'draft');
    }
  },

  setPlanDraft: (draft) => {
    set({ planDraft: draft, planStatus: draft ? 'draft' : null });
    if (draft) persistPlan(draft, 'draft');
    else clearPlan();
  },

  confirmPlan: () => {
    const { planDraft, tasks, atomicSteps, schedule } = get();
    if (!planDraft) return;

    // Update active tasks with plan data
    const active = getActive(tasks);
    const taskMap = new Map(active.map((t) => [t.title.toLowerCase(), t]));

    const updatedTasks = tasks.map((t) => {
      const planTask = planDraft.tasks?.find(
        (pt) => pt.title.toLowerCase() === t.title.toLowerCase()
      );
      if (planTask) {
        return {
          ...t,
          priority: planTask.priority as any,
          aiAnalysis: {
            ...(t.aiAnalysis ?? { category: t.category, estimatedEffort: t.estimatedHours, suggestedDeadline: '', priority: t.priority, reasoning: '' }),
            reasoning: planTask.aiSuggestion || t.aiAnalysis?.reasoning || '',
          } as any,
        };
      }
      return t;
    });

    set({
      tasks: updatedTasks,
      aiPlanResult: planDraft,
      planDraft: null,
      planStatus: 'confirmed',
      currentFocus: planDraft.focusTask,
      panicScore: { score: planDraft.panicScore, reason: planDraft.reason },
      toastMessage: '🚀 Plan activated. Your execution timeline is ready.',
    });

    saveTasks(updatedTasks);
    persistToLocal(updatedTasks);
    persistPlan(planDraft, 'confirmed');
    persistPlanResult(planDraft);

    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  cancelPlan: () => {
    set({
      planDraft: null,
      planStatus: 'cancelled',
      toastMessage: 'Plan cancelled. Your tasks are still saved.',
    });
    clearPlan();
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  setPlanStatus: (status) => set({ planStatus: status }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setToastMessage: (msg) => set({ toastMessage: msg }),

  toggleAtomicStep: (stepId) => {
    const steps: AtomicStep[] = get().atomicSteps.map((s, i, arr) => {
      if (s.id === stepId) {
        const newStatus: AtomicStep['status'] = s.completed ? 'ready' : 'done';
        return { ...s, completed: !s.completed, status: newStatus };
      }
      if (s.status === 'locked' && !s.completed) {
        const prevAllDone = arr.slice(0, i).every((p) => p.completed);
        if (prevAllDone) {
          return { ...s, status: 'ready' as AtomicStep['status'] };
        }
      }
      return s;
    });
    set({ atomicSteps: steps });

    // Update task progress based on completed steps
    const { tasks, selectedTaskId } = get();
    const taskSteps = steps.filter((s) => s.taskId === selectedTaskId);
    if (taskSteps.length > 0 && selectedTaskId) {
      const completedCount = taskSteps.filter((s) => s.completed).length;
      const progress = Math.round((completedCount / taskSteps.length) * 100);
      const updatedTasks = tasks.map((t) =>
        t.id === selectedTaskId ? { ...t, progress } : t,
      );
      set({ tasks: updatedTasks });
      saveTasks(updatedTasks);
      persistToLocal(updatedTasks);
    }
  },

  triggerCourseCorrection: (timeRemainingHours) => {
    const { tasks, schedule } = get();
    const active = getActive(tasks);
    const plan = generateCourseCorrection(active, schedule, timeRemainingHours);
    set({
      schedule: plan.correctedSchedule,
      courseCorrectionPlan: plan,
      recoveryMode: true,
    });
  },

  pivot: () => {
    const { tasks, userProfile } = get();
    const active = getActive(tasks);
    const schedule = userProfile ? generateSchedule(active, userProfile) : [];
    set({ schedule, courseCorrectionPlan: null, recoveryMode: false });
  },

  setEnergyLevel: (level) => set({ energyLevel: level }),
  setChatOpen: (open) => set({ chatOpen: open }),

  addChatMessage: (role, content) => {
    const msg: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      createdAt: new Date(),
    };
    set({ chatMessages: [...get().chatMessages, msg] });
  },

  clearChat: () => set({ chatMessages: [] }),
  setRecoveryMode: (mode) => set({ recoveryMode: mode }),
  setAIPlanResult: (result) => set({ aiPlanResult: result }),

  analyzeTaskWithAI: async (title, description, deadline) => {
    set({ analysisInProgress: true });
    try {
      const res = await fetch('/api/ai/analyze-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline }),
      });
      const data = await res.json();

      if (data.category && data.estimatedEffort) {
        const analysis: AiAnalysis = {
          category: data.category,
          estimatedEffort: data.estimatedEffort,
          suggestedDeadline: data.suggestedDeadline,
          priority: data.priority,
          reasoning: data.reasoning,
        };

        const tasks = get().tasks;
        const lastIdx = tasks.length - 1;
        if (lastIdx >= 0 && !tasks[lastIdx].aiAnalysis) {
          const updated = [...tasks];
          updated[lastIdx] = {
            ...updated[lastIdx],
            aiAnalysis: analysis,
            category: analysis.category as TaskCategory,
            estimatedHours: analysis.estimatedEffort,
            priority: analysis.priority,
          };
          set({ tasks: updated });
          await saveTasks(updated);
          persistToLocal(updated);
          get().runTriage();
        }

        set({ analysisInProgress: false });
        return analysis;
      }
      set({ analysisInProgress: false });
      return null;
    } catch {
      set({ analysisInProgress: false });
      return null;
    }
  },

  generateBattlePlan: () => {
    const { tasks, userProfile } = get();
    const active = getActive(tasks);
    if (active.length === 0) return;

    const schedule = userProfile ? generateSchedule(active, userProfile) : [];

    const allSteps: AtomicStep[] = [];
    for (const task of active.slice(0, 3)) {
      const steps = generateAtomicSteps(task);
      allSteps.push(...steps);
    }

    const top = getHighestPriorityTask(active);
    if (top) {
      const draft = generateDraft(top);
      const drafts = [...get().drafts, draft];
      set({ drafts });
      saveDrafts(drafts);
    }

    get().runTriage();

    set({
      atomicSteps: allSteps.slice(0, 8),
      schedule,
    });
  },

  loadFromDB: async () => {
    const rawTasks = await loadTasks();
    const drafts = await loadDrafts();
    const profile = await loadProfile();

    const tasks: Task[] = rawTasks.map((t: any) => ({
      ...t,
      status: t.status ?? 'pending',
      deadline: t.deadline ? new Date(t.deadline) : undefined,
      progress: t.progress ?? 0,
      estimatedHours: t.estimatedHours ?? 1,
      category: t.category ?? 'deep-work',
      priority: t.priority ?? 'normal',
    }));

    // Restore plan + selection from localStorage
    let planDraft: AIPlanResult | null = null;
    let planStatus: PlanStatus = null;
    let selectedTaskId: string | null = null;
    let aiPlanResult: AIPlanResult | null = null;

    try {
      const planRaw = localStorage.getItem(PLAN_KEY);
      if (planRaw) {
        const parsed = JSON.parse(planRaw);
        planDraft = parsed.draft ?? null;
        planStatus = parsed.status ?? null;
      }
      const resultRaw = localStorage.getItem('lmls_plan_result');
      if (resultRaw) {
        aiPlanResult = JSON.parse(resultRaw);
      }
      selectedTaskId = localStorage.getItem(SELECTED_KEY);
    } catch {}

    set({
      tasks,
      drafts,
      userProfile: profile,
      onboardingComplete: !!profile,
      planDraft,
      planStatus,
      selectedTaskId,
      aiPlanResult,
    });

    if (tasks.filter((t) => t.status !== 'completed').length > 0) {
      get().runTriage();
      const overdue = tasks.some(
        (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed',
      );
      if (overdue) set({ recoveryMode: true });
      get().generateBattlePlan();
    }
  },
}));

function persistToLocal(tasks: Task[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  } catch {}
}

function persistPlan(draft: AIPlanResult, status: PlanStatus): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ draft, status }));
  } catch {}
}

function clearPlan(): void {
  try {
    localStorage.removeItem(PLAN_KEY);
  } catch {}
}

function persistPlanResult(result: AIPlanResult): void {
  try {
    localStorage.setItem('lmls_plan_result', JSON.stringify(result));
  } catch {}
}

function calculateUrgency(task: Omit<Task, 'id' | 'createdAt' | 'status'>): number {
  let score = 0;
  if (task.deadline) {
    const hoursLeft = (new Date(task.deadline).getTime() - Date.now()) / 3600000;
    if (hoursLeft < 2) score += 40;
    else if (hoursLeft < 24) score += 30;
    else if (hoursLeft < 72) score += 20;
    else score += 10;
  }
  if (task.estimatedHours >= 8) score += 30;
  else if (task.estimatedHours >= 3) score += 20;
  else score += 10;
  if (task.progress <= 10) score += 30;
  else if (task.progress < 50) score += 15;
  return Math.min(score, 100);
}
