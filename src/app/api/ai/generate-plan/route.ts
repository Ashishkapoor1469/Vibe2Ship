import { NextRequest, NextResponse } from 'next/server';
import { generateLMLSPlan } from '@/lib/nvidia';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasks, availableTime, energyLevel, currentTime } = body;

    if (!tasks || !availableTime || !energyLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: tasks, availableTime, energyLevel' },
        { status: 400 },
      );
    }

    const plan = await generateLMLSPlan({
      tasks,
      availableTime,
      energyLevel,
      currentTime: currentTime ?? new Date().toISOString(),
      memory: body.memory ?? { averageOverestimation: 20, difficultCategories: [] },
    });

    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Plan generation failed';
    console.error('[LMLS API]', message);

    // Fallback: return client-side generated plan
    return NextResponse.json({
      error: message,
      fallback: true,
    });
  }
}
