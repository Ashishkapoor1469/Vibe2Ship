import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/nvidia';

export async function POST(req: NextRequest) {
  let tasks: any[] = [];
  let currentFocus: string | null = null;

  try {
    const body = await req.json();
    tasks = body.tasks ?? [];
    currentFocus = body.currentFocus ?? null;

    if (!body.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await chatCompletion({
      message: body.message,
      tasks,
      currentFocus,
      panicScore: body.panicScore ?? null,
      energyLevel: body.energyLevel ?? 'normal',
      memory: body.memory ?? { completedToday: 0, missedDeadlines: 0 },
      history: body.history ?? [],
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    console.error('[LMLS Chat]', message);

    // Never show "trouble reaching AI engine" — always return useful context
    const activeCount = tasks.length;
    const fallback = activeCount > 0
      ? `I'm looking at your ${activeCount} task${activeCount > 1 ? 's' : ''}.${
          currentFocus ? ` Your focus is "${currentFocus}".` : ''
        }

Try being specific:
• "What should I do next?" — I'll prioritize
• "I am stuck" — I'll give you the next physical action
• "I missed my deadline" — I'll build a recovery plan

Your data is saved. You can also try [Retry AI] below.`
      : 'You don\'t have any tasks yet. Add one and I\'ll help you execute.';

    return NextResponse.json({ response: fallback });
  }
}
