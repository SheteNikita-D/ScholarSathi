export type AssistanceLevel = 0 | 1 | 2 | 3 | 4;

export type AssistanceStage = 'THINK' | 'OBSERVE' | 'HINT' | 'GUIDE' | 'SOLUTION';

export type SubjectMode =
  | 'Mathematics'
  | 'Physics'
  | 'Electronics'
  | 'Computer Science'
  | 'Engineering'
  | 'General Problem Solving';

export type ErrorCategory =
  | 'Calculation'
  | 'Formula'
  | 'Concept'
  | 'Unit'
  | 'Logic'
  | 'Diagram'
  | 'Assumption'
  | 'Missing Step'
  | 'None';

export type LearningStateStep =
  | 'PROBLEM_ENTERED'
  | 'WORK_UPLOADED'
  | 'AI_ANALYZED'
  | 'ERROR_DISCOVERED'
  | 'SOCRATIC_QUESTION'
  | 'STUDENT_RESPONDED'
  | 'RESPONSE_EVALUATED'
  | 'HINT_PROGRESSION'
  | 'WORK_CORRECTED'
  | 'CONCEPT_CONFIRMED';

export interface AnnotationRegion {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  label: string;
  stepReference: string;
}

export interface InternalWorkAnalysis {
  problem_detected: boolean;
  subject: SubjectMode;
  topic: string;
  problem_statement_extracted: string;
  student_attempt_extracted: string;
  work_understood: boolean;
  image_clear: boolean;
  error_detected: boolean;
  error_type: ErrorCategory;
  error_investigation_prompt: string;
  suspicious_step_label: string;
  annotation_region?: AnnotationRegion;
  confidence: number;
  assistance_level: AssistanceLevel;
  feedback: string;
  next_question: string;
  hint_available: boolean;
  solution_allowed: boolean;
}

export interface TutorResponseContract {
  stage: AssistanceStage;
  observation: string;
  question: string;
  hint_available: boolean;
  next_action: string;
  partial_guidance?: string;
  concept_reminder?: string;
  solution_allowed: boolean;
  explanation?: string;
  steps?: string[];
  concept?: string;
  error_category?: ErrorCategory;
  error_investigation?: string;
  annotation_region?: AnnotationRegion;
}

export type EvaluationStatus =
  | 'correct'
  | 'partially_correct'
  | 'incorrect'
  | 'unclear'
  | 'answer_request_deflected';

export interface DialogueTurn {
  id: string;
  role: 'tutor' | 'student';
  timestamp: string;
  stage: AssistanceStage;
  content: string;
  question?: string;
  evaluationStatus?: EvaluationStatus;
  hintNumber?: number;
}

export interface LearningSummary {
  topic: string;
  subject: SubjectMode;
  whatYouDidWell: string[];
  whatYouDiscovered: string[];
  keyConceptTakeaway: string;
  hintsUsed: number;
  maxHints: number;
  solvedIndependently: boolean;
  finalStatus: string;
}

export interface TutorSession {
  id: string;
  title: string;
  subject: SubjectMode;
  topic: string;
  createdAt: string;
  problemText: string;
  studentWorkText: string;
  imageDataUrl?: string;
  assistanceLevel: AssistanceLevel;
  hintsUsed: number;
  maxHints: number;
  learningState: LearningStateStep;
  analysis?: InternalWorkAnalysis;
  currentResponse?: TutorResponseContract;
  dialogue: DialogueTurn[];
  summary?: LearningSummary;
  completed: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  subject: SubjectMode;
  topic: string;
  problemText: string;
  studentWorkSummary: string;
  svgHandwrittenGenerator: () => string;
  initialAnalysis: InternalWorkAnalysis;
  initialContract: TutorResponseContract;
  progressiveHints: {
    level: AssistanceLevel;
    stage: AssistanceStage;
    buttonLabel: string;
    observation: string;
    question: string;
    concept_reminder?: string;
    partial_guidance?: string;
    explanation?: string;
    steps?: string[];
  }[];
  sampleCorrectAnswerKeywords: string[];
  summary: LearningSummary;
}
