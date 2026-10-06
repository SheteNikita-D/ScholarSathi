import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ShieldCheck,
  Sliders,
  Target,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  AssistanceLevel,
  SubjectMode,
  TutorSession,
} from '../types/tutor';
import { ASSISTANCE_STAGES } from '../data/demoScenarios';

interface MySessionsViewProps {
  sessions: TutorSession[];
  activeSessionId: string;
  onSelectSession: (session: TutorSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  onStartNewProblem: () => void;
}

export const MySessionsView: React.FC<MySessionsViewProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  onStartNewProblem,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
            My Study Sessions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review past Socratic problem-solving sessions or permanently delete uploaded work for privacy.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={onClearAllSessions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All Sessions
            </button>
          )}
          <button
            type="button"
            onClick={onStartNewProblem}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            New Problem
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-0.5">
          <span className="font-semibold text-slate-900 block">
            Privacy-First Ephemeral Sessions
          </span>
          <p>
            Uploaded photos of handwritten notes or diagrams stay inside your active browser session and are never shared publicly. Use "Delete Session" at any time to wipe a session immediately.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-semibold text-slate-900">
            No Saved Sessions Yet
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Start a new problem or try one of the 4 multimodal demo scenarios to track your Socratic learning progress.
          </p>
          <button
            type="button"
            onClick={onStartNewProblem}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg"
          >
            Open Study Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isCurrent = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                className={`bg-white border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                  isCurrent ? 'border-sky-600' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-800">{s.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{s.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{s.createdAt}</span>
                    {s.completed && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-semibold">
                          Concept Confirmed ✓
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    {s.title || s.problemText}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
                    <span>Stage: {ASSISTANCE_STAGES[s.assistanceLevel].stage}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Hints used: {s.hintsUsed} / {s.maxHints}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Turns: {s.dialogue.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectSession(s)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
                  >
                    {isCurrent ? 'Continue Active' : 'Open Session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSession(s.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg whitespace-nowrap"
                    title="Delete this session and any uploaded image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ProgressDashboardViewProps {
  sessions: TutorSession[];
  onStartDemo: (demoId: string) => void;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  sessions,
  onStartDemo,
}) => {
  // Compute real metrics combined with baseline student portfolio stats
  const totalProblems = 12 + sessions.length;
  const uniqueTopics = new Set([
    'Linear Equations & Inverse Operations',
    "Ohm's Law & Dimensional Analysis",
    'Series-Parallel Resistor Networks',
    'Distributive Property Sign Rules',
    'Kirchhoff’s Voltage Law',
    'Newton’s Second Law Free-Body Diagrams',
    'Binary Search Loop Invariants',
    'Statics Moment Equilibrium',
    ...sessions.map((s) => s.topic),
  ]).size;

  const totalHintsUsed =
    sessions.reduce((acc, s) => acc + s.hintsUsed, 0) + 9;
  const independentCount =
    9 + sessions.filter((s) => s.hintsUsed <= 2).length;
  const independentPercent = Math.round((independentCount / totalProblems) * 100);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
          Student Learning Progress
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          GuideWise tracks independent discovery and conceptual mastery rather than simple answer completion.
        </p>
      </div>

      {/* 4 Primary Dashboard Stat Cards (Section 26) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Problems Attempted</span>
            <Layers className="w-4 h-4 text-sky-700" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            {totalProblems} Problems
          </p>
          <p className="text-xs text-slate-600">
            Across Math, Physics & Electronics
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Concepts Practiced</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            {uniqueTopics} Concepts
          </p>
          <p className="text-xs text-slate-600">
            Verified via Socratic questions
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Solved Independently</span>
            <Target className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            {independentPercent}% Independent
          </p>
          <p className="text-xs text-slate-600">
            Discovered before Stage 4 Solution ({totalHintsUsed} total hints)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            3 Day Streak
          </p>
          <p className="text-xs text-slate-600">
            Consistent daily Socratic practice
          </p>
        </div>
      </div>

      {/* Error Discovery Analytics Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Error Discovery Breakdown
            </h2>
            <p className="text-xs text-slate-600">
              Patterns of misconceptions identified on your handwritten work and resolved through Socratic questions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 pr-4">Error Category</th>
                <th className="py-2.5 px-4">Subject Domain</th>
                <th className="py-2.5 px-4">Typical Trigger</th>
                <th className="py-2.5 px-4 text-right">Occurrences</th>
                <th className="py-2.5 pl-4 text-right">Self-Corrected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 pr-4 font-semibold">Formula Application</td>
                <td className="py-3 px-4 text-slate-600">Physics</td>
                <td className="py-3 px-4 text-slate-600">
                  Writing R = V × I instead of R = V / I
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">4</td>
                <td className="py-3 pl-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                  100%
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Sign & Inverse Operation</td>
                <td className="py-3 px-4 text-slate-600">Mathematics</td>
                <td className="py-3 px-4 text-slate-600">
                  Moving +5 across = without subtracting, or distributing -a(b - c)
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">5</td>
                <td className="py-3 pl-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                  80%
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Diagram / Node Topology</td>
                <td className="py-3 px-4 text-slate-600">Electronics</td>
                <td className="py-3 px-4 text-slate-600">
                  Adding parallel branch resistors as if connected in series
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">2</td>
                <td className="py-3 pl-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                  100%
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Unit Consistency</td>
                <td className="py-3 px-4 text-slate-600">Engineering</td>
                <td className="py-3 px-4 text-slate-600">
                  Mixing mA and A or cm and m without conversion factor
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">1</td>
                <td className="py-3 pl-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Practice Launchers */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Practice a Targeted Socratic Scenario
          </h3>
          <p className="text-xs text-slate-600">
            Launch any of the 4 multimodal demonstration problems to test your error-discovery streak.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStartDemo('demo-math-linear')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
          >
            Math Demo
          </button>
          <button
            type="button"
            onClick={() => onStartDemo('demo-physics-ohms')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
          >
            Physics Demo
          </button>
          <button
            type="button"
            onClick={() => onStartDemo('demo-electronics-circuit')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
          >
            Circuit Demo
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConceptsViewProps {
  onSelectSubjectAndProblem: (
    subject: SubjectMode,
    problemText: string,
    studentWorkText: string
  ) => void;
}

const CONCEPT_LIBRARY: {
  subject: SubjectMode;
  topic: string;
  socraticStyleQuestion: string;
  keyPrinciple: string;
  sampleProblem: string;
  sampleAttempt: string;
}[] = [
  {
    subject: 'Mathematics',
    topic: 'Linear & Quadratic Equations',
    socraticStyleQuestion: 'Which algebraic rule or inverse operation applies to this expression?',
    keyPrinciple: 'Applying the exact same inverse operation to both sides preserves equality.',
    sampleProblem: 'Solve for x: 4x - 7 = 21',
    sampleAttempt: 'Step 1: 4x = 21 - 7\nStep 2: 4x = 14\nStep 3: x = 3.5',
  },
  {
    subject: 'Physics',
    topic: "Ohm's Law & Kinematics",
    socraticStyleQuestion: 'Which physical relationship connects these quantities, and do the units match?',
    keyPrinciple: 'Check dimensional consistency on both sides of a physical formula before substituting numbers.',
    sampleProblem: 'A car accelerates from rest at 3 m/s² for 4 seconds. Find the distance traveled.',
    sampleAttempt: 'Step 1: d = a × t\nStep 2: d = 3 × 4 = 12 m',
  },
  {
    subject: 'Electronics',
    topic: 'Series-Parallel Circuits & Kirchhoff’s Laws',
    socraticStyleQuestion: 'Before calculating the current, what does the circuit node connection tell you?',
    keyPrinciple: 'Elements in series carry identical current; elements in parallel share the same voltage across two shared nodes.',
    sampleProblem: 'Two 10Ω resistors are connected in parallel across a 5V battery. Find total current.',
    sampleAttempt: 'Step 1: R_total = 10Ω + 10Ω = 20Ω\nStep 2: I = 5V / 20Ω = 0.25A',
  },
  {
    subject: 'Computer Science',
    topic: 'Loop Invariants & Array Indexing',
    socraticStyleQuestion: 'What should this loop do during its second iteration and at the boundary index?',
    keyPrinciple: 'Trace off-by-one boundary conditions using a small 3-element test array.',
    sampleProblem: 'Sum all elements of array arr of length n: for (int i = 1; i <= n; i++) sum += arr[i];',
    sampleAttempt: 'In 0-indexed C/Java/JS, starting at i = 1 and ending at i <= n accesses all elements.',
  },
  {
    subject: 'Engineering',
    topic: 'Statics Equilibrium & Unit Conversions',
    socraticStyleQuestion: 'What assumption are you making in this design step, and are all forces in SI base units?',
    keyPrinciple: 'Sum of forces (ΣF = 0) and sum of moments (ΣM = 0) require consistent force and length units.',
    sampleProblem: 'Calculate torque τ when a 50 N force is applied perpendicular to a 30 cm wrench.',
    sampleAttempt: 'Step 1: τ = F × r\nStep 2: τ = 50 N × 30 cm = 1500 N·m',
  },
];

export const ConceptsView: React.FC<ConceptsViewProps> = ({
  onSelectSubjectAndProblem,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
          Subject Modes & Socratic Questioning Library
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore how GuideWise adapts its Socratic questioning strategy across academic disciplines. Click any card to load a practice problem with a subtle student error.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONCEPT_LIBRARY.map((item) => (
          <div
            key={item.subject}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-sky-800">{item.subject}</span>
                <span aria-hidden="true">·</span>
                <span>{item.topic}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Characteristic Socratic Prompt
                </span>
                <p className="text-sm font-serif-display text-slate-900">
                  “{item.socraticStyleQuestion}”
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Core Principle: </span>
                {item.keyPrinciple}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 truncate">
                Try: {item.sampleProblem}
              </span>
              <button
                type="button"
                onClick={() =>
                  onSelectSubjectAndProblem(
                    item.subject,
                    item.sampleProblem,
                    item.sampleAttempt
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shrink-0 whitespace-nowrap"
              >
                Practice Concept
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SettingsViewProps {
  largeTextMode: boolean;
  onToggleLargeText: () => void;
  defaultAssistanceLevel: AssistanceLevel;
  onChangeDefaultAssistance: (level: AssistanceLevel) => void;
  onClearAllSessions: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  largeTextMode,
  onToggleLargeText,
  defaultAssistanceLevel,
  onChangeDefaultAssistance,
  onClearAllSessions,
}) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
          Accessibility & Tutor Preferences
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure readability, audio assistance, default Socratic level, and student data privacy.
        </p>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Volume2 className="w-4 h-4 text-sky-700" />
          <h2 className="text-base font-semibold text-slate-900">
            Accessibility Controls
          </h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Large Readable Text Mode
            </p>
            <p className="text-xs text-slate-600">
              Increases font sizes for Socratic questions, observations, and mathematical steps.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={largeTextMode}
            onClick={onToggleLargeText}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              largeTextMode
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {largeTextMode ? 'Enabled ✓' : 'Enable Large Text'}
          </button>
        </div>
      </div>

      {/* Default Assistance Level Policy */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-sky-700" />
          <h2 className="text-base font-semibold text-slate-900">
            Default Starting Assistance Level
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Choose which stage on the Guidance Meter new problems start at by default. (Level 0 — THINK is recommended for Socratic discovery).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {ASSISTANCE_STAGES.map((stage) => (
            <button
              key={stage.stage}
              type="button"
              onClick={() => onChangeDefaultAssistance(stage.level)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                defaultAssistanceLevel === stage.level
                  ? 'border-sky-600 bg-sky-50/70 text-sky-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-mono text-xs font-semibold">
                L{stage.level} · {stage.stage}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {stage.shortDesc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy & Ephemeral Data Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Student Work Privacy
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
            Uploaded photographs of student notebooks and diagrams are processed in-memory for multimodal Socratic feedback and are never stored on public servers.
          </p>
          <button
            type="button"
            onClick={onClearAllSessions}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Wipe All Local Session Data
          </button>
        </div>
      </div>
    </div>
  );
};
