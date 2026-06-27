import { NextRequest, NextResponse } from 'next/server';
import { analyzeTask } from '@/lib/nvidia';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, deadline } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const analysis = await analyzeTask({ title, description, deadline });
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    console.error('[LMLS Analyze]', message);

    // Fallback analysis
    return NextResponse.json({
      category: 'deep-work',
      estimatedEffort: 2,
      suggestedDeadline: 'tomorrow',
      priority: 'normal',
      reasoning: 'AI analysis unavailable. Estimated based on task title.',
    });
  }
}
