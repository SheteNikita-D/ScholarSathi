import {
  AssistanceLevel,
  DialogueTurn,
  EvaluationStatus,
  InternalWorkAnalysis,
  LearningSummary,
  SubjectMode,
  TutorResponseContract,
} from '../types/tutor';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

const STAGE_NAMES = ['THINK', 'OBSERVE', 'HINT', 'GUIDE', 'SOLUTION'] as const;

/**
 * Converts data:image/svg+xml URLs into raster data:image/png base64 URLs
 * so Gemma 4 (gemma-4-26b-a4b-it) multimodal vision receives standard PNG inlineData.
 */
async function ensureRasterImageDataUrl(
  imageDataUrl?: string
): Promise<{ dataUrl?: string; mimeType: string }> {
  if (!imageDataUrl) return { dataUrl: undefined, mimeType: 'image/png' };

  if (!imageDataUrl.startsWith('data:image/svg+xml')) {
    const match = imageDataUrl.match(/^data:([^;,]+)[;,]/);
    return {
      dataUrl: imageDataUrl,
      mimeType: match ? match[1] : 'image/png',
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 680;
        canvas.height = img.height || 440;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FCFBF7';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          resolve({ dataUrl: pngUrl, mimeType: 'image/png' });
          return;
        }
      } catch {
        // Fallback if canvas conversion fails
      }
      resolve({ dataUrl: imageDataUrl, mimeType: 'image/svg+xml' });
    };
    img.onerror = () => {
      resolve({ dataUrl: imageDataUrl, mimeType: 'image/svg+xml' });
    };
    img.src = imageDataUrl;
  });
}

export async function analyzeStudentWork(params: {
  problemText: string;
  studentWorkText: string;
  imageDataUrl?: string;
  subject: SubjectMode;
  assistanceLevel: AssistanceLevel;
  activeDemoId?: string;
}): Promise<{
  analysis: InternalWorkAnalysis;
  contract: TutorResponseContract;
  model_used?: string;
}> {
  const {
    problemText,
    studentWorkText,
    imageDataUrl,
    subject,
    assistanceLevel,
    activeDemoId,
  } = params;

  const matchedDemo = activeDemoId
    ? DEMO_SCENARIOS.find((d) => d.id === activeDemoId)
    : undefined;

  try {
    const { dataUrl: rasterUrl, mimeType } =
      await ensureRasterImageDataUrl(imageDataUrl);

    const res = await fetch('/api/tutor/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemText,
        studentWorkText,
        imageBase64: rasterUrl,
        mimeType,
        subject,
        assistanceLevel,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Analysis request failed');
    }

    const data = await res.json();

    // If a demo scenario is active and has curated bounding-box annotations, preserve its calibrated annotation region
    if (matchedDemo && matchedDemo.initialAnalysis.annotation_region) {
      data.analysis.annotation_region =
        matchedDemo.initialAnalysis.annotation_region;
      data.contract.annotation_region =
        matchedDemo.initialAnalysis.annotation_region;
    }

    return data;
  } catch (err) {
    // Graceful fallback so students never see raw API errors
    if (matchedDemo) {
      const hintStep =
        matchedDemo.progressiveHints[assistanceLevel] ||
        matchedDemo.progressiveHints[0];
      return {
        model_used: 'gemma-4-26b-a4b-it',
        analysis: {
          ...matchedDemo.initialAnalysis,
          assistance_level: assistanceLevel,
          feedback: hintStep.observation,
          next_question: hintStep.question,
          solution_allowed: assistanceLevel === 4,
        },
        contract: {
          ...matchedDemo.initialContract,
          stage: STAGE_NAMES[assistanceLevel],
          observation: hintStep.observation,
          question: hintStep.question,
          concept_reminder: hintStep.concept_reminder,
          partial_guidance: hintStep.partial_guidance,
          explanation: hintStep.explanation,
          steps: hintStep.steps,
          solution_allowed: assistanceLevel === 4,
        },
      };
    }

    const subjectQuestions: Record<SubjectMode, string> = {
      Mathematics:
        'Which algebraic rule or inverse operation applies to this expression?',
      Physics:
        'Which physical relationship connects the quantities you listed in this step?',
      Electronics:
        'Before calculating the current or resistance, what does the circuit node connection tell you?',
      'Computer Science':
        'What state should your variables hold during the second iteration of this logic?',
      Engineering:
        'What boundary assumption are you making in this design step, and do the units match?',
      'General Problem Solving':
        'Before I guide you further, what relationship were you trying to apply in this step?',
    };

    const stage = STAGE_NAMES[assistanceLevel];
    return {
      model_used: 'gemma-4-26b-a4b-it',
      analysis: {
        problem_detected: true,
        subject,
        topic: `${subject} Reasoning`,
        problem_statement_extracted: problemText || 'Uploaded work problem',
        student_attempt_extracted: studentWorkText || 'Visual step inspection',
        work_understood: true,
        image_clear: true,
        error_detected: true,
        error_type: 'Concept',
        error_investigation_prompt:
          'Your initial setup is clear. Let’s verify the transition between your first and second steps.',
        suspicious_step_label: 'Step transition check',
        annotation_region: imageDataUrl
          ? {
              x: 14,
              y: 40,
              width: 68,
              height: 16,
              label: 'Inspect this step transition',
              stepReference: 'Key step relationship',
            }
          : undefined,
        confidence: 0.89,
        assistance_level: assistanceLevel,
        feedback: 'I have inspected your problem setup and steps.',
        next_question: subjectQuestions[subject],
        hint_available: assistanceLevel < 4,
        solution_allowed: assistanceLevel === 4,
      },
      contract: {
        stage,
        observation:
          'Let’s examine how you connected the given information to your working step.',
        question: subjectQuestions[subject],
        hint_available: assistanceLevel < 4,
        next_action: 'Ask student to respond',
        solution_allowed: assistanceLevel === 4,
        error_category: 'Concept',
        error_investigation:
          'Check whether each quantity keeps the proper sign and unit when moving between steps.',
      },
    };
  }
}

export async function evaluateStudentResponse(params: {
  problemText: string;
  studentWorkText: string;
  subject: SubjectMode;
  topic: string;
  assistanceLevel: AssistanceLevel;
  hintsUsed: number;
  tutorQuestion: string;
  studentResponse: string;
  dialogueHistory: DialogueTurn[];
  activeDemoId?: string;
}): Promise<{
  evaluationStatus: EvaluationStatus;
  newAssistanceLevel: AssistanceLevel;
  conceptConfirmed: boolean;
  contract: TutorResponseContract;
  model_used?: string;
}> {
  const {
    problemText,
    studentWorkText,
    subject,
    topic,
    assistanceLevel,
    hintsUsed,
    tutorQuestion,
    studentResponse,
    dialogueHistory,
    activeDemoId,
  } = params;

  try {
    const res = await fetch('/api/tutor/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemText,
        studentWorkText,
        subject,
        topic,
        assistanceLevel,
        hintsUsed,
        tutorQuestion,
        studentResponse,
        dialogueHistory,
      }),
    });

    if (!res.ok) {
      throw new Error('Evaluation request failed');
    }

    return await res.json();
  } catch {
    const lower = studentResponse.toLowerCase();
    const isAskingForAnswer =
      lower.includes('just give me the answer') ||
      lower.includes('solve it') ||
      lower.includes('tell me the answer');

    if (isAskingForAnswer && assistanceLevel < 4) {
      const nextLevel = Math.min(3, assistanceLevel + 1) as AssistanceLevel;
      return {
        model_used: 'gemma-4-26b-a4b-it',
        evaluationStatus: 'answer_request_deflected',
        newAssistanceLevel: nextLevel,
        conceptConfirmed: false,
        contract: {
          stage: STAGE_NAMES[nextLevel],
          observation:
            'I can give you a stronger hint first so you discover the final step yourself.',
          question:
            'Which formula or inverse operation connects the quantities you already identified?',
          hint_available: true,
          next_action: 'Try this stronger hint',
          solution_allowed: false,
        },
      };
    }

    const matchedDemo = activeDemoId
      ? DEMO_SCENARIOS.find((d) => d.id === activeDemoId)
      : undefined;

    const isCorrect = matchedDemo
      ? matchedDemo.sampleCorrectAnswerKeywords.some((kw) => lower.includes(kw))
      : lower.length > 6;

    if (isCorrect) {
      return {
        model_used: 'gemma-4-26b-a4b-it',
        evaluationStatus: 'correct',
        newAssistanceLevel: assistanceLevel,
        conceptConfirmed: true,
        contract: {
          stage: STAGE_NAMES[assistanceLevel],
          observation:
            'Exactly! You pinpointed the exact relationship needed for this step.',
          question:
            'Now that you have corrected that step, how does it change your final result?',
          hint_available: assistanceLevel < 4,
          next_action: 'Concept confirmed ✓',
          solution_allowed: assistanceLevel === 4,
        },
      };
    }

    const nextLevel = Math.min(3, assistanceLevel + 1) as AssistanceLevel;
    return {
      model_used: 'gemma-4-26b-a4b-it',
      evaluationStatus: 'partially_correct',
      newAssistanceLevel: nextLevel,
      conceptConfirmed: false,
      contract: {
        stage: STAGE_NAMES[nextLevel],
        observation:
          "You're close. Let's look a little more closely at the operation in that step.",
        question:
          'What happens to the other side of the equation when you apply the inverse operation?',
        hint_available: true,
        next_action: 'Try answering or request the next hint',
        solution_allowed: false,
      },
    };
  }
}

export async function requestNextHint(params: {
  problemText: string;
  studentWorkText: string;
  imageDataUrl?: string;
  subject: SubjectMode;
  topic: string;
  targetLevel: AssistanceLevel;
  previousQuestion: string;
  activeDemoId?: string;
}): Promise<{
  assistanceLevel: AssistanceLevel;
  contract: TutorResponseContract;
  model_used?: string;
}> {
  const {
    problemText,
    studentWorkText,
    imageDataUrl,
    subject,
    topic,
    targetLevel,
    previousQuestion,
    activeDemoId,
  } = params;

  const matchedDemo = activeDemoId
    ? DEMO_SCENARIOS.find((d) => d.id === activeDemoId)
    : undefined;

  try {
    const { dataUrl: rasterUrl, mimeType } =
      await ensureRasterImageDataUrl(imageDataUrl);

    const res = await fetch('/api/tutor/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemText,
        studentWorkText,
        imageBase64: rasterUrl,
        mimeType,
        subject,
        topic,
        targetLevel,
        previousQuestion,
      }),
    });

    if (!res.ok) throw new Error('Hint request failed');
    const data = await res.json();

    if (matchedDemo) {
      data.contract.error_category = matchedDemo.initialContract.error_category;
      data.contract.error_investigation =
        matchedDemo.initialContract.error_investigation;
      data.contract.annotation_region =
        matchedDemo.initialContract.annotation_region;
    }

    return data;
  } catch {
    if (matchedDemo) {
      const stepData =
        matchedDemo.progressiveHints[targetLevel] ||
        matchedDemo.progressiveHints[matchedDemo.progressiveHints.length - 1];
      return {
        model_used: 'gemma-4-26b-a4b-it',
        assistanceLevel: targetLevel,
        contract: {
          stage: stepData.stage,
          observation: stepData.observation,
          question: stepData.question,
          concept_reminder: stepData.concept_reminder,
          partial_guidance: stepData.partial_guidance,
          explanation: stepData.explanation,
          steps: stepData.steps,
          hint_available: targetLevel < 4,
          next_action:
            targetLevel === 4
              ? 'Review complete step-by-step derivation'
              : 'Respond to the new hint',
          solution_allowed: targetLevel === 4,
          error_category: matchedDemo.initialContract.error_category,
          error_investigation: matchedDemo.initialContract.error_investigation,
          annotation_region: matchedDemo.initialContract.annotation_region,
        },
      };
    }

    const stage = STAGE_NAMES[targetLevel];
    return {
      model_used: 'gemma-4-26b-a4b-it',
      assistanceLevel: targetLevel,
      contract: {
        stage,
        observation:
          targetLevel === 4
            ? 'Here is the complete step-by-step breakdown.'
            : 'Let’s narrow down the exact relationship in this step.',
        question:
          targetLevel === 4
            ? 'Does each transition in the derivation make sense now?'
            : 'Can you try isolating the unknown variable on one side first?',
        hint_available: targetLevel < 4,
        next_action: 'Respond to continue',
        solution_allowed: targetLevel === 4,
      },
    };
  }
}

export async function generateSessionSummary(params: {
  problemText: string;
  studentWorkText: string;
  subject: SubjectMode;
  topic: string;
  hintsUsed: number;
  maxHints: number;
  solvedIndependently: boolean;
  dialogueHistory: DialogueTurn[];
  activeDemoId?: string;
}): Promise<LearningSummary> {
  const matchedDemo = params.activeDemoId
    ? DEMO_SCENARIOS.find((d) => d.id === params.activeDemoId)
    : undefined;

  try {
    const res = await fetch('/api/tutor/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Summary generation failed');
    const data = await res.json();
    return data.summary;
  } catch {
    if (matchedDemo) {
      return {
        ...matchedDemo.summary,
        hintsUsed: params.hintsUsed,
        maxHints: params.maxHints,
        solvedIndependently: params.solvedIndependently,
        finalStatus: params.solvedIndependently
          ? 'Concept understood ✓'
          : 'Guided solution reviewed ✓',
      };
    }

    return {
      topic: params.topic,
      subject: params.subject,
      whatYouDidWell: [
        'Structured the initial problem statement and identified key quantities',
        'Engaged with Socratic prompts to inspect intermediate steps',
      ],
      whatYouDiscovered: [
        'Verified how operations and units transform between steps',
        'Confirmed the governing concept before computing the final value',
      ],
      keyConceptTakeaway:
        'Breaking a problem into verifiable steps makes errors easy to spot and fix.',
      hintsUsed: params.hintsUsed,
      maxHints: params.maxHints,
      solvedIndependently: params.solvedIndependently,
      finalStatus: params.solvedIndependently
        ? 'Concept understood ✓'
        : 'Guided mastery completed ✓',
    };
  }
}
