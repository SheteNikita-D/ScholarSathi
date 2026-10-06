import React from 'react';
import {
  ArrowDown,
  CheckCircle2,
  Compass,
  Eye,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Unlock,
} from 'lucide-react';
import { AssistanceLevel, LearningStateStep } from '../types/tutor';
import { ASSISTANCE_STAGES } from '../data/demoScenarios';

interface GuidanceMeterProps {
  currentLevel: AssistanceLevel;
  hintsUsed: number;
  maxHints: number;
  learningState: LearningStateStep;
  onSelectLevel: (level: AssistanceLevel) => void;
}

const STAGE_STYLES: Record<
  AssistanceLevel,
  {
    activeBorder: string;
    activeBg: string;
    activeText: string;
    dotColor: string;
    icon: React.FC<{ className?: string }>;
  }
> = {
  0: {
    activeBorder: 'border-emerald-600',
    activeBg: 'bg-emerald-50/80',
    activeText: 'text-emerald-900',
    dotColor: 'bg-emerald-600',
    icon: HelpCircle,
  },
  1: {
    activeBorder: 'border-sky-600',
    activeBg: 'bg-sky-50/80',
    activeText: 'text-sky-900',
    dotColor: 'bg-sky-600',
    icon: Eye,
  },
  2: {
    activeBorder: 'border-amber-600',
    activeBg: 'bg-amber-50/80',
    activeText: 'text-amber-900',
    dotColor: 'bg-amber-600',
    icon: Lightbulb,
  },
  3: {
    activeBorder: 'border-indigo-600',
    activeBg: 'bg-indigo-50/80',
    activeText: 'text-indigo-900',
    dotColor: 'bg-indigo-600',
    icon: Compass,
  },
  4: {
    activeBorder: 'border-rose-600',
    activeBg: 'bg-rose-50/80',
    activeText: 'text-rose-900',
    dotColor: 'bg-rose-600',
    icon: Unlock,
  },
};

const LEARNING_STEPS: { id: LearningStateStep; label: string }[] = [
  { id: 'PROBLEM_ENTERED', label: 'Problem & Work' },
  { id: 'AI_ANALYZED', label: 'AI Understands Work' },
  { id: 'ERROR_DISCOVERED', label: 'Error Discovery' },
  { id: 'SOCRATIC_QUESTION', label: 'Socratic Question' },
  { id: 'RESPONSE_EVALUATED', label: 'Response Evaluated' },
  { id: 'CONCEPT_CONFIRMED', label: 'Concept Confirmed' },
];

const STATE_ORDER: Record<LearningStateStep, number> = {
  PROBLEM_ENTERED: 0,
  WORK_UPLOADED: 0,
  AI_ANALYZED: 1,
  ERROR_DISCOVERED: 2,
  SOCRATIC_QUESTION: 3,
  STUDENT_RESPONDED: 4,
  RESPONSE_EVALUATED: 4,
  HINT_PROGRESSION: 3,
  WORK_CORRECTED: 5,
  CONCEPT_CONFIRMED: 5,
};

export const GuidanceMeter: React.FC<GuidanceMeterProps> = ({
  currentLevel,
  hintsUsed,
  maxHints,
  learningState,
  onSelectLevel,
}) => {
  const hintsRemaining = Math.max(0, maxHints - hintsUsed);
  const activeStageMeta = ASSISTANCE_STAGES[currentLevel];
  const activeStyle = STAGE_STYLES[currentLevel];
  const currentStepIndex = STATE_ORDER[learningState] ?? 0;

  return (
    <aside
      aria-label="Guidance Meter and Learning State"
      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-5"
    >
      {/* Header & Current Status Summary */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h2 className="text-base font-semibold text-slate-900">
            Guidance Meter
          </h2>
          <span className="font-mono text-xs tabular-nums text-slate-600">
            Level {currentLevel} / 4
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Controls how much help GuideWise reveals so you discover the answer first.
        </p>

        {/* Active Assistance Status Readout */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Current assistance</span>
            <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${activeStyle.dotColor}`} />
              {activeStageMeta.stage} ({activeStageMeta.title})
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Hints remaining</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5 block">
              {hintsRemaining} of {maxHints}
            </span>
          </div>
        </div>
      </div>

      {/* Vertical 5-Stage Socratic Escalation Ladder */}
      <div className="flex flex-col" role="radiogroup" aria-label="Assistance Levels">
        {ASSISTANCE_STAGES.map((item, idx) => {
          const isCurrent = item.level === currentLevel;
          const isPassed = item.level < currentLevel;
          const style = STAGE_STYLES[item.level];
          const IconComponent = style.icon;

          return (
            <React.Fragment key={item.stage}>
              <button
                type="button"
                role="radio"
                aria-checked={isCurrent}
                onClick={() => onSelectLevel(item.level)}
                className={`w-full text-left rounded-lg p-3 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isCurrent
                    ? `${style.activeBorder} ${style.activeBg}`
                    : isPassed
                    ? 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100/70'
                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? `${style.dotColor} text-white`
                          : isPassed
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-semibold tracking-tight ${
                            isCurrent ? style.activeText : 'text-slate-800'
                          }`}
                        >
                          {item.stage}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-600 truncate">
                          {item.shortDesc}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="font-mono text-[11px] font-semibold text-slate-900 shrink-0">
                      ACTIVE
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <p className="text-xs text-slate-700 mt-2 pl-8 leading-relaxed">
                    {item.teacherBehavior}
                  </p>
                )}
              </button>

              {idx < ASSISTANCE_STAGES.length - 1 && (
                <div className="flex justify-center py-1" aria-hidden="true">
                  <ArrowDown
                    className={`w-3.5 h-3.5 ${
                      item.level < currentLevel ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Session Learning State Progression */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Learning State
          </span>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            Step {currentStepIndex + 1} / {LEARNING_STEPS.length}
          </span>
        </div>
        <ol className="space-y-1.5">
          {LEARNING_STEPS.map((step, index) => {
            const isDone = index < currentStepIndex || learningState === 'CONCEPT_CONFIRMED';
            const isActive = index === currentStepIndex && learningState !== 'CONCEPT_CONFIRMED';
            return (
              <li
                key={step.id}
                className={`flex items-center justify-between text-xs py-1 px-2 rounded ${
                  isActive
                    ? 'bg-sky-50 text-sky-950 font-semibold'
                    : isDone
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isDone
                        ? 'text-emerald-600'
                        : isActive
                        ? 'text-sky-600'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>{step.label}</span>
                </span>
                {isActive && (
                  <span className="font-mono text-[11px] text-sky-700">Current</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
};
