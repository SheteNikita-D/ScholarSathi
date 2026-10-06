import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AssistanceLevel,
  DialogueTurn,
  EvaluationStatus,
  InternalWorkAnalysis,
  LearningSummary,
  TutorResponseContract,
} from '../types/tutor';

interface TutorPanelProps {
  analysis?: InternalWorkAnalysis;
  contract?: TutorResponseContract;
  assistanceLevel: AssistanceLevel;
  hintsUsed: number;
  maxHints: number;
  dialogue: DialogueTurn[];
  summary?: LearningSummary;
  isLoading: boolean;
  onSendStudentResponse: (responseText: string) => void;
  onEscalateHint: () => void;
  onRequestSolution: () => void;
  onCompleteSession: () => void;
  largeTextMode?: boolean;
}

const PROGRESSIVE_HINT_LABELS: Record<AssistanceLevel, string> = {
  0: 'Need a Hint?',
  1: 'Give me a stronger hint',
  2: 'One more hint',
  3: 'Guide me through this step',
  4: 'Solution Unlocked',
};

const EVALUATION_BADGES: Record<
  EvaluationStatus,
  { label: string; colorClass: string }
> = {
  correct: {
    label: 'Correct reasoning — ready for next step',
    colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  partially_correct: {
    label: 'Close — check one more detail',
    colorClass: 'text-amber-900 bg-amber-50 border-amber-200',
  },
  incorrect: {
    label: "Let's slow down and inspect the relationship",
    colorClass: 'text-sky-900 bg-sky-50 border-sky-200',
  },
  unclear: {
    label: 'Tell me a bit more about your step',
    colorClass: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  answer_request_deflected: {
    label: 'Learning-First Mode: Stronger hint provided before full solution',
    colorClass: 'text-indigo-900 bg-indigo-50 border-indigo-200',
  },
};

export const TutorPanel: React.FC<TutorPanelProps> = ({
  analysis,
  contract,
  assistanceLevel,
  hintsUsed,
  maxHints,
  dialogue,
  summary,
  isLoading,
  onSendStudentResponse,
  onEscalateHint,
  onRequestSolution,
  onCompleteSession,
  largeTextMode = false,
}) => {
  const [studentInput, setStudentInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confirmSolutionPrompt, setConfirmSolutionPrompt] = useState(false);
  const responseInputRef = useRef<HTMLInputElement | null>(null);

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window) || !contract) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${contract.observation}. Question: ${contract.question}${
      contract.concept_reminder ? `. Concept reminder: ${contract.concept_reminder}` : ''
    }${contract.partial_guidance ? `. Guidance: ${contract.partial_guidance}` : ''}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.96;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim() || isLoading) return;
    onSendStudentResponse(studentInput.trim());
    setStudentInput('');
  };

  if (!contract || !analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Ready to Inspect Your Work
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Enter a problem above, upload a photo of your handwritten solution, or pick one of the 4 Demo Scenarios to experience Socratic error discovery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. SPECIAL FEATURE: ERROR DISCOVERY ("Something to investigate") */}
      {analysis.error_detected && (
        <section
          aria-label="Error Discovery"
          className="bg-white border border-amber-300/90 rounded-xl p-5 space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900">
                Something to Investigate
              </h3>
            </div>
            {/* Unboxed clean metadata following Zero-Pill Discipline */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono tabular-nums">
              <span>Category: {analysis.error_type}</span>
              <span aria-hidden="true">·</span>
              <span>Target: {analysis.suspicious_step_label}</span>
              <span aria-hidden="true">·</span>
              <span>Confidence: {Math.round(analysis.confidence * 100)}%</span>
            </div>
          </div>

          <p
            className={`${
              largeTextMode ? 'text-base' : 'text-sm'
            } text-slate-800 leading-relaxed`}
          >
            {contract.error_investigation || analysis.error_investigation_prompt}
          </p>
        </section>
      )}

      {/* Fallback Clarification Banner if Image is Unclear */}
      {!analysis.image_clear && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <p className="font-semibold">I can't confidently read this step yet.</p>
            <p>
              Please upload a clearer photo, crop the relevant area, or type the unclear equation in the work box so I don't guess any symbols.
            </p>
          </div>
        </div>
      )}

      {/* 2. MAIN AI SOCRATIC TUTOR PANEL */}
      <section
        aria-label="GuideWise Socratic Tutor"
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"
      >
        {/* Top Tutor Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif-display font-semibold text-sm">
              GW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  GuideWise Socratic Tutor
                </h3>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono text-xs font-semibold text-sky-800">
                  Stage: {contract.stage}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {analysis.subject} · {analysis.topic}
              </p>
            </div>
          </div>

          {/* Accessibility: Read Hint Aloud */}
          <button
            type="button"
            onClick={handleReadAloud}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
            aria-label={isSpeaking ? 'Stop reading hint aloud' : 'Read hint aloud'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                Read Hint Aloud
              </>
            )}
          </button>
        </div>

        {/* Observation & Socratic Question Focus Box */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">
              Tutor Observation
            </span>
            <p
              className={`${
                largeTextMode ? 'text-base' : 'text-sm'
              } text-slate-700 leading-relaxed`}
            >
              {contract.observation}
            </p>
          </div>

          <div className="bg-sky-50/70 border border-sky-200/90 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-900">
              <HelpCircle className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Socratic Guiding Question</span>
            </div>
            <p
              className={`${
                largeTextMode ? 'text-lg' : 'text-base'
              } font-serif-display font-medium text-slate-900 leading-snug`}
            >
              “{contract.question}”
            </p>
          </div>

          {/* Concept Reminder (Level 2+) */}
          {contract.concept_reminder && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-800 space-y-0.5">
                <span className="font-semibold text-amber-950 block">
                  Concept Reminder
                </span>
                <p className="leading-relaxed font-mono">{contract.concept_reminder}</p>
              </div>
            </div>
          )}

          {/* Partial Step Guidance (Level 3+) */}
          {contract.partial_guidance && (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-3.5 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-800 space-y-0.5">
                <span className="font-semibold text-indigo-950 block">
                  Step Setup Guidance
                </span>
                <p className="leading-relaxed">{contract.partial_guidance}</p>
              </div>
            </div>
          )}

          {/* Full Step-by-Step Solution (Only when Level 4 SOLUTION is unlocked) */}
          {contract.stage === 'SOLUTION' && (contract.explanation || contract.steps) && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" />
                  Step-by-Step Reasoning Unlocked
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  STAGE 4 · SOLUTION
                </span>
              </div>
              {contract.explanation && (
                <p className="text-xs text-slate-200 leading-relaxed">
                  {contract.explanation}
                </p>
              )}
              {contract.steps && contract.steps.length > 0 && (
                <ol className="space-y-2 border-t border-slate-800 pt-3">
                  {contract.steps.map((stepText, i) => (
                    <li
                      key={i}
                      className="text-xs font-mono text-slate-100 flex items-start gap-2.5"
                    >
                      <span className="text-sky-400 font-semibold select-none">
                        0{i + 1}.
                      </span>
                      <span>{stepText}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* 3. ACTION BUTTONS: [ I know ] [ Need a hint ] [ I'm stuck ] */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => responseInputRef.current?.focus()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              I know — Let me answer
            </button>

            {assistanceLevel < 4 && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onEscalateHint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200/80 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5 text-sky-700" />
                {PROGRESSIVE_HINT_LABELS[assistanceLevel]}
                <span className="font-mono text-[11px] text-sky-700 ml-0.5 tabular-nums">
                  ({hintsUsed}/{maxHints})
                </span>
              </button>
            )}

            {assistanceLevel < 4 && (
              <button
                type="button"
                onClick={() => setConfirmSolutionPrompt(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
              >
                I'm stuck
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onCompleteSession}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Finish & View Summary
          </button>
        </div>

        {/* Deliberate Anti-Cheating Confirmation Bar when "I'm stuck / Show Solution" is clicked */}
        {confirmSolutionPrompt && assistanceLevel < 4 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 max-w-lg">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-0.5">
                <p className="font-semibold text-slate-900">
                  Want to try one stronger hint before revealing the full solution?
                </p>
                <p>
                  Discovering the step yourself builds stronger retention, or you can unlock the full step-by-step derivation now.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmSolutionPrompt(false);
                  onEscalateHint();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg whitespace-nowrap"
              >
                Give Stronger Hint First
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSolutionPrompt(false);
                  onRequestSolution();
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg whitespace-nowrap"
              >
                Show Solution Now
              </button>
            </div>
          </div>
        )}

        {/* 4. STUDENT RESPONSE INPUT & INTERACTIVE DIALOGUE */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <label
            htmlFor="student-socratic-response"
            className="block text-xs font-semibold text-slate-800"
          >
            Your Response to GuideWise
          </label>
          <div className="flex gap-2">
            <input
              id="student-socratic-response"
              ref={responseInputRef}
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Answer the tutor's question, write your corrected step, or ask a question..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!studentInput.trim() || isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Thinking...' : 'Submit Response'}
            </button>
          </div>
        </form>

        {/* Session Socratic Dialogue Log */}
        {dialogue.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <span className="text-xs font-semibold text-slate-600 block">
              Session Reasoning Log ({dialogue.length} turns)
            </span>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {dialogue.map((turn) => {
                const evalBadge = turn.evaluationStatus
                  ? EVALUATION_BADGES[turn.evaluationStatus]
                  : null;
                return (
                  <div
                    key={turn.id}
                    className={`rounded-lg p-3 text-xs ${
                      turn.role === 'student'
                        ? 'bg-slate-100 text-slate-900 ml-6'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {turn.role === 'student' ? 'You (Student)' : `GuideWise · ${turn.stage}`}
                      </span>
                      <span className="font-mono tabular-nums">{turn.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{turn.content}</p>
                    {turn.question && (
                      <p className="mt-1 font-medium text-sky-950">
                        <ChevronRight className="w-3 h-3 inline mr-0.5 text-sky-700" />
                        {turn.question}
                      </p>
                    )}
                    {evalBadge && (
                      <div
                        className={`mt-2 inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${evalBadge.colorClass}`}
                      >
                        {evalBadge.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 5. LEARNING SUMMARY CARD (Section 15) */}
      {summary && (
        <section
          aria-label="Learning Summary"
          className="bg-white border-2 border-emerald-600/80 rounded-xl p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Learning Summary
                </h3>
                <p className="text-xs text-slate-600">
                  {summary.subject} · {summary.topic}
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">
              <span className="font-semibold text-emerald-800 block">
                {summary.finalStatus}
              </span>
              <span className="text-slate-500">
                Hints used: {summary.hintsUsed} / {summary.maxHints}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-950">
                What you did well
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {summary.whatYouDidWell.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-semibold text-sky-950">
                What you discovered
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {summary.whatYouDiscovered.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-800">
            <span className="font-semibold text-slate-900">Key Takeaway: </span>
            <span>{summary.keyConceptTakeaway}</span>
          </div>
        </section>
      )}
    </div>
  );
};
