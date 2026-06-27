const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function callNVIDIA(
  messages: { role: string; content: string }[],
  temperature = 0.3,
  responseFormat?: 'json' | 'text',
) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY not configured');

  const body: Record<string, unknown> = {
    model: 'meta/llama-3.1-70b-instruct',
    messages,
    temperature,
    max_tokens: 2048,
    top_p: 0.9,
  };

  if (responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(NVIDIA_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in NVIDIA response');

  if (responseFormat === 'json') {
    const cleaned = content.replace(/```(?:json)?\s*/gi, '').trim();
    return JSON.parse(cleaned);
  }

  return content;
}

export interface AnalyzeTaskRequest {
  title: string;
  description?: string;
  deadline?: string;
}

export interface AnalyzeTaskResponse {
  category: string;
  estimatedEffort: number;
  suggestedDeadline: string;
  priority: 'critical' | 'important' | 'normal' | 'low';
  reasoning: string;
}

export async function analyzeTask(data: AnalyzeTaskRequest): Promise<AnalyzeTaskResponse> {
  const prompt = `Analyze this task and return JSON only:

Task: "${data.title}"
${data.description ? `Description: "${data.description}"` : ''}
${data.deadline ? `Deadline: "${data.deadline}"` : ''}

Return EXACTLY:
{
  "category": "academic" | "deep-work" | "maintenance" | "creative" | "review",
  "estimatedEffort": <number in hours>,
  "suggestedDeadline": "<relative e.g. tomorrow, in 2 days>",
  "priority": "critical" | "important" | "normal" | "low",
  "reasoning": "<brief reasoning>"
}`;

  return callNVIDIA(
    [
      {
        role: 'system',
        content: 'You are LMLS, an AI productivity analyst. Analyze tasks and estimate effort, category, deadline, and priority. Return ONLY valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    0.3,
    'json',
  );
}

export interface ChatRequest {
  message: string;
  tasks: { title: string; deadline?: string; priority: string; progress: number; status: string }[];
  currentFocus: string | null;
  panicScore: number | null;
  energyLevel: string;
  memory: {
    completedToday: number;
    missedDeadlines: number;
  };
  history?: { role: string; content: string }[];
}

export async function chatCompletion(data: ChatRequest): Promise<{ response: string }> {
  const taskList = data.tasks
    .map(
      (t) =>
        `- "${t.title}" (deadline: ${t.deadline ?? 'none'}, priority: ${t.priority}, progress: ${t.progress}%, status: ${t.status})`,
    )
    .join('\n');

  const systemPrompt = `You are LMLS Assistant, an AI emergency productivity manager and execution partner.

You know the user's complete context:
- Tasks and deadlines
- Current focus
- Panic score
- Energy level
- Productivity history

Rules:
1. Be direct, practical, and specific. NEVER give generic advice.
2. Reference the user's ACTUAL tasks from the context below.
3. If the user missed a deadline: analyze what failed, what can be saved, give an immediate next action and recovery plan.
4. If the user is stuck: give the single next physical action (e.g. "Open the file", "Write the first paragraph").
5. Keep responses concise — 3-5 bullet points maximum.
6. Use a calm, authoritative tone. Never apologize.

Current context:
- Tasks: ${taskList || '(no tasks)'}
- Current focus: ${data.currentFocus ?? 'none'}
- Panic score: ${data.panicScore ?? 'N/A'}/10
- Energy level: ${data.energyLevel}
- Completed today: ${data.memory.completedToday}
- Missed deadlines: ${data.memory.missedDeadlines}

IMPORTANT: You MUST respond with valid JSON in EXACTLY this format:
{ "response": "your answer here" }

Do not include any other fields. The "response" value should be your complete reply to the user.`;

  const userPrompt = `${data.message}

(Remember: respond with JSON: { "response": "..." })`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(data.history ?? []),
    { role: 'user', content: userPrompt },
  ];

  const result = await callNVIDIA(messages, 0.35, 'json');

  if (result && typeof result.response === 'string') {
    return { response: result.response };
  }
  // If the model returned a different structure, try to extract text
  const text = result?.response ?? result?.message ?? result?.text ?? JSON.stringify(result);
  return { response: text };
}

export interface LMLSPlanRequest {
  tasks: {
    title: string;
    deadline?: string;
    estimatedHours: number;
    progress: number;
    category: string;
    priority: string;
    status: string;
  }[];
  availableTime: number;
  energyLevel: string;
  currentTime: string;
  memory: {
    averageOverestimation: number;
    difficultCategories: string[];
  };
}

export interface LMLSPlanResponse {
  panicScore: number;
  priority: string;
  reason: string;
  focusTask: string;
  tasks: { title: string; priority: string; estimatedEffort: string; aiSuggestion: string }[];
  atomicSteps: { title: string; duration: string; reason: string; completed: boolean }[];
  schedule: { start: string; end: string; task: string }[];
  recommendations: string[];
  preparedContent: { type: string; content: string };
}

export async function generateLMLSPlan(
  data: LMLSPlanRequest,
  onProgress?: (step: string) => void,
): Promise<LMLSPlanResponse> {
  onProgress?.('Analyzing your tasks...');

  const taskList = data.tasks
    .map(
      (t) =>
        `- "${t.title}" (deadline: ${t.deadline ?? 'none'}, effort: ${t.estimatedHours}h, progress: ${t.progress}%, category: ${t.category}, priority: ${t.priority}, status: ${t.status})`,
    )
    .join('\n');

  const prompt = `Generate an emergency productivity plan.

Current time: ${data.currentTime}
Available time: ${data.availableTime}h
Energy level: ${data.energyLevel}

Tasks:
${taskList || '(none provided)'}

Memory insights:
- User overestimates effort by ~${data.memory.averageOverestimation}%
- Difficult categories: ${data.memory.difficultCategories.join(', ') || 'none'}

Return EXACTLY this JSON:
{
  "panicScore": <number 1-10>,
  "priority": "critical" | "important" | "normal" | "low",
  "reason": "<why this score — reference specific tasks>",
  "focusTask": "<single most important task>",
  "tasks": [
    { "title": "<task title>", "priority": "critical" | "important" | "normal" | "low", "estimatedEffort": "<hours>", "aiSuggestion": "<specific actionable tip>" }
  ],
  "atomicSteps": [
    { "title": "<action>", "duration": "<e.g. 15min>", "reason": "<why>", "completed": false }
  ],
  "schedule": [
    { "start": "<HH:MM>", "end": "<HH:MM>", "task": "<what to do>" }
  ],
  "recommendations": ["<tip 1>", "<tip 2>"],
  "preparedContent": {
    "type": "draft" | "checklist" | "strategy" | "code" | "analysis" | "resources",
    "content": "<ready-to-use content>"
  }
}`;

  onProgress?.('Calculating panic score...');

  const result = await callNVIDIA(
    [
      {
        role: 'system',
        content: 'You are LMLS, an AI emergency productivity manager. Analyze ALL tasks, not just one. Generate structured execution plans. Return ONLY valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    0.3,
    'json',
  );

  onProgress?.('Building execution timeline...');
  onProgress?.('Plan ready.');

  return result;
}
