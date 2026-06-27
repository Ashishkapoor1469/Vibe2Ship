export type Priority = 'critical' | 'important' | 'normal' | 'low';
export type EnergyProfile = 'morning-lark' | 'night-owl' | 'afternoon-bear';
export type EnergyLevel = 'low' | 'normal' | 'high';
export type TaskCategory = 'deep-work' | 'maintenance' | 'creative' | 'review' | 'academic';
export type TaskStatus = 'pending' | 'active' | 'completed' | 'missed';
export type DraftType = 'draft' | 'checklist' | 'strategy' | 'code' | 'analysis' | 'resources';
export type MessageRole = 'user' | 'assistant' | 'system';
export type PlanStatus = 'draft' | 'confirmed' | 'cancelled' | null;

export interface AiAnalysis {
  category: string;
  estimatedEffort: number;
  suggestedDeadline: string;
  priority: Priority;
  reasoning: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  estimatedHours: number;
  progress: number;
  category: TaskCategory;
  priority: Priority;
  urgencyScore?: number;
  aiAnalysis?: AiAnalysis;
  status: TaskStatus;
  createdAt: Date;
  links?: string[];
  tags?: string[];
  atomicSteps?: AtomicStep[];
}

export interface PanicScore {
  score: number;
  reason: string;
}

export interface AtomicStep {
  id: string;
  title: string;
  estimatedMinutes: number;
  goal: string;
  tip: string;
  taskId: string;
  completed: boolean;
  status: 'ready' | 'locked' | 'done';
}

export interface ScheduleBlock {
  start: Date;
  end: Date;
  type: 'deep-work' | 'maintenance' | 'break' | 'buffer' | 'review';
  taskId?: string;
  title: string;
}

export interface Draft {
  id: string;
  taskId: string;
  type: 'outline' | 'introduction' | 'structure' | 'template' | 'email' | 'code-plan';
  content: string;
  createdAt: Date;
}

export interface UserProfile {
  energyProfile: EnergyProfile;
  frictionTimes: string[];
  availableHoursToday: number;
  deepWorkPreference: 'morning' | 'afternoon' | 'night' | 'any';
}

export interface CourseCorrectionPlan {
  originalSchedule: ScheduleBlock[];
  correctedSchedule: ScheduleBlock[];
  removedTasks: string[];
  deprioritizedTasks: string[];
  recoveryTimeline: string;
  minimumDeliverable: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface TaskMemory {
  taskId: string;
  title: string;
  category: TaskCategory;
  estimatedHours: number;
  actualHours?: number;
  completedAt?: Date;
  missed: boolean;
  deadline?: Date;
  difficultyRating?: number;
}

export interface ProductivityMemory {
  completedTasks: TaskMemory[];
  missedDeadlines: number;
  averageCompletionRate: number;
  difficultCategories: { category: string; count: number }[];
  averageOverestimation: number;
  totalTasksCompleted: number;
}

export interface AIPlanResult {
  panicScore: number;
  priority: Priority;
  reason: string;
  focusTask: string;
  tasks: {
    title: string;
    priority: Priority;
    estimatedEffort: string;
    aiSuggestion: string;
  }[];
  atomicSteps: {
    title: string;
    duration: string;
    reason: string;
    completed: boolean;
  }[];
  schedule: {
    start: string;
    end: string;
    task: string;
  }[];
  recommendations: string[];
  preparedContent: {
    type: DraftType;
    content: string;
  };
}

export interface LMLSState {
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
}
