import { v4 as uuidv4 } from 'uuid';
import { Task, Draft } from './types';

export function generateDraft(task: Task): Draft {
  const title = task.title.toLowerCase();

  if (title.includes('email') || title.includes('mail')) {
    return generateEmailDraft(task);
  }
  if (title.includes('presentation') || title.includes('slide') || title.includes('deck')) {
    return generatePresentationDraft(task);
  }
  if (title.includes('report') || title.includes('paper') || title.includes('essay')) {
    return generateReportDraft(task);
  }
  if (
    title.includes('code') ||
    title.includes('app') ||
    title.includes('feature') ||
    title.includes('api')
  ) {
    return generateCodeDraft(task);
  }
  if (title.includes('assignment') || title.includes('homework')) {
    return generateAssignmentDraft(task);
  }

  return generateGenericDraft(task);
}

function generateEmailDraft(task: Task): Draft {
  const content = `Subject: [Regarding ${task.title}]

Hi [Name],

I hope this message finds you well.

I'm reaching out to provide an update on ${task.title}. [Add key points here — status, next steps, blockers.]

Please let me know if you need any additional details or if there's anything I should adjust.

Best regards,
[Your Name]`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'email',
    content,
    createdAt: new Date(),
  };
}

function generatePresentationDraft(task: Task): Draft {
  const content = `# ${task.title}

## Slide Structure

1. **Title Slide** — ${task.title}
2. **Problem Statement** — What problem are we solving?
3. **Current Status** — Where are we now?
4. **Proposed Approach** — How we'll solve it
5. **Timeline & Milestones** — Key dates
6. **Resources Needed** — What we require
7. **Next Steps** — Action items
8. **Q&A** — Open floor

---

## Key Talking Points
- [Point 1]
- [Point 2]
- [Point 3]

## Data / Metrics Needed
- [Metric 1]
- [Metric 2]`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'structure',
    content,
    createdAt: new Date(),
  };
}

function generateReportDraft(task: Task): Draft {
  const content = `# ${task.title}

## Introduction
[2-3 sentences setting context and importance]

## Background
[Relevant context and prior work]

## Analysis / Findings
### Finding 1
[Description]
### Finding 2
[Description]
### Finding 3
[Description]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

## Conclusion
[Summary paragraph]

## References
- [Source 1]
- [Source 2]`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'outline',
    content,
    createdAt: new Date(),
  };
}

function generateCodeDraft(task: Task): Draft {
  const content = `# Implementation Plan: ${task.title}

## Architecture Overview
- **Component/Module**: [Name]
- **Entry Point**: [File path]
- **Dependencies**: [List]

## Implementation Steps
1. Create type definitions
2. Set up data flow
3. Implement core logic
4. Add error handling
5. Write tests

## Starter Structure
\`\`\`typescript
// types.ts
export interface Props {
  // TODO: define
}

// main.ts
export async function main(): Promise<void> {
  // TODO: implement
}
\`\`\`

## Edge Cases to Handle
- [Edge case 1]
- [Edge case 2]
- [Edge case 3]`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'code-plan',
    content,
    createdAt: new Date(),
  };
}

function generateAssignmentDraft(task: Task): Draft {
  const content = `# ${task.title}

## Introduction
[Opening paragraph — state the topic, your thesis, and how you'll approach it.]

## Main Body
### Section 1: [Topic]
- Key point A
- Key point B
- Evidence / example

### Section 2: [Topic]
- Key point A
- Key point B
- Evidence / example

### Section 3: [Topic]
- Key point A
- Key point B
- Evidence / example

## Conclusion
[Summarize findings, restate thesis, suggest further research]

## References
- [Citation 1]
- [Citation 2]`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'outline',
    content,
    createdAt: new Date(),
  };
}

function generateGenericDraft(task: Task): Draft {
  const content = `# ${task.title}

## Objective
[What success looks like]

## Current Status
${task.progress > 0 ? `${task.progress}% complete` : 'Not yet started'}

## Next Actions
1. [First action — estimated X min]
2. [Second action — estimated Y min]
3. [Third action — estimated Z min]

## Resources / References
- [Link or note 1]
- [Link or note 2]

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Review
- [ ] Submit / Deliver`;

  return {
    id: uuidv4(),
    taskId: task.id,
    type: 'template',
    content,
    createdAt: new Date(),
  };
}
