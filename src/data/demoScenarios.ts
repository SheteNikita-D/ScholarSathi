import { DemoScenario, AssistanceStage, AssistanceLevel } from '../types/tutor';

export const ASSISTANCE_STAGES: {
  level: AssistanceLevel;
  stage: AssistanceStage;
  title: string;
  shortDesc: string;
  teacherBehavior: string;
}[] = [
  {
    level: 0,
    stage: 'THINK',
    title: 'Think',
    shortDesc: 'Reflective question only',
    teacherBehavior: 'Prompts you to reflect on your approach without pointing out the exact mistake.',
  },
  {
    level: 1,
    stage: 'OBSERVE',
    title: 'Observe',
    shortDesc: 'Points to suspicious step',
    teacherBehavior: 'Directs your attention to a specific equation, branch, or step worth inspecting.',
  },
  {
    level: 2,
    stage: 'HINT',
    title: 'Hint',
    shortDesc: 'Small conceptual reminder',
    teacherBehavior: 'Provides the governing theorem, physical law, or algebraic rule needed.',
  },
  {
    level: 3,
    stage: 'GUIDE',
    title: 'Guidance',
    shortDesc: 'Partial step walkthrough',
    teacherBehavior: 'Guides you on how to set up or rearrange the step while leaving the calculation to you.',
  },
  {
    level: 4,
    stage: 'SOLUTION',
    title: 'Solution',
    shortDesc: 'Full step-by-step reasoning',
    teacherBehavior: 'Unlocks the complete worked derivation only when requested or after hints are exhausted.',
  },
];

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-math-linear',
    title: 'Demo 1: Linear Equation Inverse Operation',
    badge: 'Mathematics · Algebra',
    subject: 'Mathematics',
    topic: 'Solving Linear Equations & Inverse Operations',
    problemText: 'Solve for x: 2x + 5 = 15',
    studentWorkSummary: 'Step 1: 2x + 5 = 15\nStep 2: 2x = 15 + 5\nStep 3: 2x = 20\nStep 4: x = 10',
    svgHandwrittenGenerator: () =>
      svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 440" width="680" height="440">
          <defs>
            <pattern id="grid1" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="440" fill="#FCFBF7"/>
          <rect width="680" height="440" fill="url(#grid1)"/>
          <line x1="64" y1="0" x2="64" y2="440" stroke="#FCA5A5" stroke-width="1.5"/>
          
          <text x="84" y="46" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#64748B">PROBLEM STATEMENT</text>
          <text x="84" y="78" font-family="Fraunces, Georgia, serif" font-size="22" font-weight="600" fill="#0F172A">Solve for x:   2x + 5 = 15</text>
          <line x1="84" y1="96" x2="620" y2="96" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4"/>

          <text x="84" y="132" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#475569">STUDENT HANDWRITTEN ATTEMPT:</text>
          
          <text x="90" y="180" font-family="IBM Plex Mono, monospace" font-size="21" fill="#1E293B">Step 1:   2x + 5 = 15</text>
          
          <text x="90" y="242" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="600" fill="#0F172A">Step 2:   2x = 15 + 5</text>
          <text x="415" y="242" font-family="IBM Plex Mono, monospace" font-size="14" font-style="italic" fill="#64748B">(moved 5 to RHS)</text>
          
          <text x="90" y="304" font-family="IBM Plex Mono, monospace" font-size="21" fill="#1E293B">Step 3:   2x = 20</text>
          
          <text x="90" y="366" font-family="IBM Plex Mono, monospace" font-size="21" fill="#1E293B">Step 4:    x = 20 / 2 = 10</text>
          <rect x="235" y="340" width="95" height="36" rx="4" fill="none" stroke="#334155" stroke-width="1.5"/>
        </svg>
      `),
    initialAnalysis: {
      problem_detected: true,
      subject: 'Mathematics',
      topic: 'Linear Equations (Inverse Operations)',
      problem_statement_extracted: 'Solve 2x + 5 = 15',
      student_attempt_extracted: 'Step 1: 2x + 5 = 15 → Step 2: 2x = 15 + 5 → Step 3: 2x = 20 → Step 4: x = 10',
      work_understood: true,
      image_clear: true,
      error_detected: true,
      error_type: 'Calculation',
      error_investigation_prompt:
        'Your approach isolates the 2x term nicely in Step 2, but check what happened to the sign of +5 when moving it across the equals sign.',
      suspicious_step_label: 'Step 2: 2x = 15 + 5',
      annotation_region: {
        x: 11,
        y: 48,
        width: 74,
        height: 12,
        label: 'Inspect Step 2 operation',
        stepReference: 'Step 2: 2x = 15 + 5',
      },
      confidence: 0.98,
      assistance_level: 0,
      feedback: 'You set up a clear step-by-step algebraic isolation of x.',
      next_question: 'Look at what happened to the +5 in Step 2. What operation undoes adding 5 to both sides of an equation?',
      hint_available: true,
      solution_allowed: false,
    },
    initialContract: {
      stage: 'THINK',
      observation: 'You correctly identified that isolating the 2x term is the first goal.',
      question: 'Look at what happened to the +5 in Step 2. What operation would undo adding 5?',
      hint_available: true,
      next_action: 'Ask student to respond',
      solution_allowed: false,
      error_category: 'Calculation',
      error_investigation:
        'Your strategy looks structured until Step 2. Investigate how the +5 term transitions to the right-hand side of the equation.',
      annotation_region: {
        x: 11,
        y: 48,
        width: 74,
        height: 12,
        label: 'Inspect Step 2 operation',
        stepReference: 'Step 2: 2x = 15 + 5',
      },
    },
    progressiveHints: [
      {
        level: 0,
        stage: 'THINK',
        buttonLabel: 'Need a Hint?',
        observation: 'You isolated 2x on the left side in Step 2.',
        question: 'Look at what happened to the +5. What operation would undo adding 5?',
      },
      {
        level: 1,
        stage: 'OBSERVE',
        buttonLabel: 'Give me a stronger hint',
        observation: 'In Step 2, you wrote 2x = 15 + 5, which gave 2x = 20.',
        question: 'If x were 10, what would 2(10) + 5 equal when you substitute it back into the original equation?',
      },
      {
        level: 2,
        stage: 'HINT',
        buttonLabel: 'One more hint',
        observation: 'To keep an equation balanced, you must apply the inverse operation to both sides.',
        question: 'Since 5 is added to 2x on the left, what happens when you subtract 5 from both sides?',
        concept_reminder: 'Additive Inverse Property: If a + b = c, then a = c - b.',
      },
      {
        level: 3,
        stage: 'GUIDE',
        buttonLabel: 'Guide me through this step',
        observation: 'Subtracting 5 from both sides removes +5 from the left and subtracts 5 from 15 on the right.',
        question: 'Rewrite Step 2 as 2x = 15 - 5. What value do you get for 2x, and then for x?',
        partial_guidance: 'Replace "2x = 15 + 5" with "2x = 15 - 5", simplify the right side, and divide by 2.',
      },
      {
        level: 4,
        stage: 'SOLUTION',
        buttonLabel: 'Show Solution',
        observation: 'Full step-by-step derivation unlocked.',
        question: 'Can you see how subtracting 5 keeps both sides balanced?',
        explanation:
          'To isolate 2x, we undo the addition of 5 by subtracting 5 from both sides of the equation rather than adding it.',
        steps: [
          'Start with the original equation: 2x + 5 = 15',
          'Subtract 5 from both sides (inverse of +5): 2x = 15 - 5',
          'Simplify the right-hand side: 2x = 10',
          'Divide both sides by 2: x = 10 / 2 = 5',
          'Check: 2(5) + 5 = 10 + 5 = 15 ✓',
        ],
      },
    ],
    sampleCorrectAnswerKeywords: ['subtract', 'minus', '15 - 5', '2x = 10', 'x = 5', 'x=5', 'subtract 5'],
    summary: {
      topic: 'Solving Linear Equations & Inverse Operations',
      subject: 'Mathematics',
      whatYouDidWell: [
        'Identified that the constant term (5) must be moved first to isolate 2x',
        'Correctly divided by the coefficient 2 in the final step',
      ],
      whatYouDiscovered: [
        'Moving an added term across the equals sign requires subtraction (the inverse operation)',
        'Substituting the final answer back into the original equation quickly catches sign mistakes',
      ],
      keyConceptTakeaway: 'Maintaining equality requires applying the inverse operation (subtraction undoes addition) to both sides.',
      hintsUsed: 1,
      maxHints: 4,
      solvedIndependently: true,
      finalStatus: 'Concept understood ✓',
    },
  },
  {
    id: 'demo-physics-ohms',
    title: 'Demo 2: Ohm’s Law Formula Application',
    badge: 'Physics · Electromagnetism',
    subject: 'Physics',
    topic: "Ohm's Law & Dimensional Consistency",
    problemText: 'Calculate resistance R when voltage V = 20V and current I = 2A.',
    studentWorkSummary: 'Given: V = 20V, I = 2A\nStep 1: R = V × I\nStep 2: R = 20V × 2A\nStep 3: R = 40 Ω',
    svgHandwrittenGenerator: () =>
      svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 440" width="680" height="440">
          <defs>
            <pattern id="grid2" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="440" fill="#FCFBF7"/>
          <rect width="680" height="440" fill="url(#grid2)"/>
          <line x1="64" y1="0" x2="64" y2="440" stroke="#FCA5A5" stroke-width="1.5"/>

          <text x="84" y="46" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#64748B">PHYSICS WORKSHEET</text>
          <text x="84" y="76" font-family="Fraunces, Georgia, serif" font-size="20" font-weight="600" fill="#0F172A">Calculate resistance when V = 20 V and I = 2 A.</text>
          <line x1="84" y1="94" x2="620" y2="94" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4"/>

          <text x="90" y="142" font-family="IBM Plex Mono, monospace" font-size="18" fill="#334155">Given:   V = 20 V,   I = 2 A,   Find R = ?</text>

          <text x="90" y="212" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="600" fill="#0F172A">Step 1:   R = V × I</text>
          <text x="370" y="212" font-family="IBM Plex Mono, monospace" font-size="14" font-style="italic" fill="#64748B">(Ohm's Law formula)</text>

          <text x="90" y="278" font-family="IBM Plex Mono, monospace" font-size="21" fill="#1E293B">Step 2:   R = 20 V × 2 A</text>

          <text x="90" y="344" font-family="IBM Plex Mono, monospace" font-size="21" fill="#1E293B">Step 3:   R = 40 Ω</text>
          <rect x="210" y="318" width="110" height="36" rx="4" fill="none" stroke="#334155" stroke-width="1.5"/>
        </svg>
      `),
    initialAnalysis: {
      problem_detected: true,
      subject: 'Physics',
      topic: "Ohm's Law",
      problem_statement_extracted: 'Calculate resistance when V = 20V and I = 2A.',
      student_attempt_extracted: 'Given: V = 20V, I = 2A → Step 1: R = V × I → Step 2: R = 20 × 2 → Step 3: R = 40 Ω',
      work_understood: true,
      image_clear: true,
      error_detected: true,
      error_type: 'Formula',
      error_investigation_prompt:
        'You listed the given quantities V and I accurately, but inspect the formula written in Step 1 connecting R, V, and I.',
      suspicious_step_label: 'Step 1: R = V × I',
      annotation_region: {
        x: 11,
        y: 42,
        width: 68,
        height: 12,
        label: 'Inspect formula relationship',
        stepReference: 'Step 1: R = V × I',
      },
      confidence: 0.96,
      assistance_level: 0,
      feedback: 'Your given values and units are clearly organized.',
      next_question: 'What relationship connects voltage, current, and resistance? Look closely at the operation between V and I.',
      hint_available: true,
      solution_allowed: false,
    },
    initialContract: {
      stage: 'THINK',
      observation: 'You clearly extracted V = 20V and I = 2A from the problem statement.',
      question: 'What relationship connects voltage, current, and resistance? Look at the operation between V and I.',
      hint_available: true,
      next_action: 'Ask student to respond',
      solution_allowed: false,
      error_category: 'Formula',
      error_investigation:
        'Your known values are set up properly. Investigate Step 1: does multiplying Volts by Amperes produce Ohms (resistance) or Watts (power)?',
      annotation_region: {
        x: 11,
        y: 42,
        width: 68,
        height: 12,
        label: 'Inspect formula relationship',
        stepReference: 'Step 1: R = V × I',
      },
    },
    progressiveHints: [
      {
        level: 0,
        stage: 'THINK',
        buttonLabel: 'Need a Hint?',
        observation: 'You extracted V = 20V and I = 2A accurately.',
        question: 'What relationship connects voltage, current, and resistance? Look at the operation between V and I.',
      },
      {
        level: 1,
        stage: 'OBSERVE',
        buttonLabel: 'Give me a stronger hint',
        observation: 'Take another look at Step 1: R = V × I.',
        question: 'In physics, V × I actually calculates Electrical Power (Watts). How is Voltage (V) written in standard Ohm’s Law?',
      },
      {
        level: 2,
        stage: 'HINT',
        buttonLabel: 'One more hint',
        observation: 'Remember that resistance, voltage, and current are related by V = I × R.',
        question: 'If V = I × R, which quantity should V be divided by to isolate R on its own?',
        concept_reminder: "Ohm's Law states that V = I · R (Voltage equals Current multiplied by Resistance).",
      },
      {
        level: 3,
        stage: 'GUIDE',
        buttonLabel: 'Guide me through this step',
        observation: 'Rearranging V = I × R to make R the subject gives R = V / I.',
        question: 'Substitute V = 20V and I = 2A into R = V / I. What value of resistance do you get?',
        partial_guidance: 'Try rearranging V = IR so that resistance is the subject (R = V / I), then check your substitution.',
      },
      {
        level: 4,
        stage: 'SOLUTION',
        buttonLabel: 'Show Solution',
        observation: 'Step-by-step solution unlocked.',
        question: 'Notice how dividing voltage by current yields the correct unit of Ohms (V/A = Ω).',
        explanation:
          "By Ohm's Law (V = IR), resistance is the ratio of voltage to current (R = V / I), whereas multiplying V × I gives electrical power.",
        steps: [
          "Recall Ohm's Law in standard form: V = I × R",
          'Divide both sides by current (I) to solve for R: R = V / I',
          'Substitute the given values: R = 20 V / 2 A',
          'Calculate the final resistance: R = 10 Ω',
        ],
      },
    ],
    sampleCorrectAnswerKeywords: ['v / i', 'v/i', 'divide', '20 / 2', '10', '10 ohm', 'v = ir', 'v=ir'],
    summary: {
      topic: "Ohm's Law & Dimensional Consistency",
      subject: 'Physics',
      whatYouDidWell: [
        'Identified voltage (20V) and current (2A) accurately from the problem',
        'Included proper SI unit notation in your final answer',
      ],
      whatYouDiscovered: [
        'Multiplying V × I yields electrical power (Watts), not resistance',
        "Rearranging V = I · R gives R = V / I for calculating resistance",
      ],
      keyConceptTakeaway: 'Resistance opposes current: for a fixed voltage, R = V / I.',
      hintsUsed: 1,
      maxHints: 4,
      solvedIndependently: true,
      finalStatus: 'Concept understood ✓',
    },
  },
  {
    id: 'demo-electronics-circuit',
    title: 'Demo 3: Series-Parallel Circuit Diagram Analysis',
    badge: 'Electronics · Circuit Topology',
    subject: 'Electronics',
    topic: 'Series vs. Parallel Resistor Networks',
    problemText: 'Find the total equivalent resistance R_eq seen by the 12V source where R1 = 4Ω, R2 = 6Ω, and R3 = 3Ω.',
    studentWorkSummary: 'Step 1: All three resistors are on the right of the source.\nStep 2: R_eq = R1 + R2 + R3 = 4 + 6 + 3 = 13 Ω\nStep 3: I_total = 12V / 13Ω = 0.92 A',
    svgHandwrittenGenerator: () =>
      svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 440" width="680" height="440">
          <defs>
            <pattern id="grid3" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="440" fill="#FCFBF7"/>
          <rect width="680" height="440" fill="url(#grid3)"/>

          <!-- Schematic Diagram Box -->
          <rect x="44" y="28" width="592" height="210" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <text x="64" y="54" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#475569">DRAWN CIRCUIT SCHEMATIC</text>

          <!-- Voltage source -->
          <line x1="110" y1="80" x2="110" y2="120" stroke="#0F172A" stroke-width="2.5"/>
          <circle cx="110" cy="140" r="20" fill="none" stroke="#0F172A" stroke-width="2.5"/>
          <text x="104" y="137" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="600" fill="#0F172A">+</text>
          <text x="105" y="152" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="600" fill="#0F172A">-</text>
          <text x="58" y="145" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="600" fill="#0F172A">12V</text>
          <line x1="110" y1="160" x2="110" y2="205" stroke="#0F172A" stroke-width="2.5"/>

          <!-- Top Wire and R1 -->
          <line x1="110" y1="80" x2="195" y2="80" stroke="#0F172A" stroke-width="2.5"/>
          <rect x="195" y="68" width="70" height="24" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.2"/>
          <text x="202" y="60" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600" fill="#0F172A">R1 = 4Ω</text>
          <line x1="265" y1="80" x2="460" y2="80" stroke="#0F172A" stroke-width="2.5"/>

          <!-- Node A dot -->
          <circle cx="360" cy="80" r="4.5" fill="#0284C7"/>
          <text x="342" y="66" font-family="IBM Plex Mono, monospace" font-size="12" font-weight="600" fill="#0284C7">Node A</text>

          <!-- Parallel Branch R2 (inner vertical) -->
          <line x1="360" y1="80" x2="360" y2="115" stroke="#0F172A" stroke-width="2.5"/>
          <rect x="348" y="115" width="24" height="55" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.2"/>
          <text x="282" y="148" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600" fill="#0F172A">R2 = 6Ω</text>
          <line x1="360" y1="170" x2="360" y2="205" stroke="#0F172A" stroke-width="2.5"/>

          <!-- Parallel Branch R3 (outer vertical) -->
          <line x1="460" y1="80" x2="460" y2="115" stroke="#0F172A" stroke-width="2.5"/>
          <rect x="448" y="115" width="24" height="55" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.2"/>
          <text x="482" y="148" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600" fill="#0F172A">R3 = 3Ω</text>
          <line x1="460" y1="170" x2="460" y2="205" stroke="#0F172A" stroke-width="2.5"/>

          <!-- Bottom return wire -->
          <line x1="110" y1="205" x2="460" y2="205" stroke="#0F172A" stroke-width="2.5"/>
          <circle cx="360" cy="205" r="4.5" fill="#0284C7"/>
          <text x="342" y="224" font-family="IBM Plex Mono, monospace" font-size="12" font-weight="600" fill="#0284C7">Node B</text>

          <!-- Student Handwritten Work below schematic -->
          <text x="64" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#475569">STUDENT HANDWRITTEN CALCULATION:</text>
          <text x="64" y="314" font-family="IBM Plex Mono, monospace" font-size="20" font-weight="600" fill="#0F172A">Step 1:  R_eq = R1 + R2 + R3 = 4 + 6 + 3 = 13 Ω</text>
          <text x="64" y="362" font-family="IBM Plex Mono, monospace" font-size="19" fill="#334155">Step 2:  I_total = V / R_eq = 12V / 13Ω = 0.92 A</text>
        </svg>
      `),
    initialAnalysis: {
      problem_detected: true,
      subject: 'Electronics',
      topic: 'Series-Parallel Resistor Networks',
      problem_statement_extracted: 'Find equivalent resistance R_eq and total current for R1=4Ω, R2=6Ω, R3=3Ω across 12V.',
      student_attempt_extracted: 'Step 1: R_eq = R1 + R2 + R3 = 4 + 6 + 3 = 13 Ω → Step 2: I = 12 / 13 = 0.92 A',
      work_understood: true,
      image_clear: true,
      error_detected: true,
      error_type: 'Diagram',
      error_investigation_prompt:
        'Look at how R2 and R3 are connected between Node A and Node B in your schematic compared to Step 1 where all three resistors were added directly.',
      suspicious_step_label: 'Parallel branch R2 & R3 / Step 1 addition',
      annotation_region: {
        x: 40,
        y: 13,
        width: 40,
        height: 39,
        label: 'Inspect Node A–B branch connections',
        stepReference: 'R2 (6Ω) and R3 (3Ω) shared nodes',
      },
      confidence: 0.95,
      assistance_level: 0,
      feedback: 'You applied Ohm’s Law properly in Step 2 once you had an equivalent resistance.',
      next_question: 'Look at the branch containing R2 and R3 between Node A and Node B. Are those two resistors connected in series or in parallel?',
      hint_available: true,
      solution_allowed: false,
    },
    initialContract: {
      stage: 'THINK',
      observation: 'In Step 1, you added R1 + R2 + R3 directly as if the same current flows through all three.',
      question: 'Look at the branch containing R2 and R3 between Node A and Node B. Are those two components connected in series or in parallel?',
      hint_available: true,
      next_action: 'Ask student to respond',
      solution_allowed: false,
      error_category: 'Diagram',
      error_investigation:
        'Trace the current leaving R1 at Node A. Does it flow through R2 and R3 sequentially in a single path, or does it split across two branches?',
      annotation_region: {
        x: 40,
        y: 13,
        width: 40,
        height: 39,
        label: 'Inspect Node A–B branch connections',
        stepReference: 'R2 (6Ω) and R3 (3Ω) shared nodes',
      },
    },
    progressiveHints: [
      {
        level: 0,
        stage: 'THINK',
        buttonLabel: 'Need a Hint?',
        observation: 'In Step 1, you summed all three resistances directly.',
        question: 'Look at the branch containing R2 and R3. Are those two components connected in series or parallel?',
      },
      {
        level: 1,
        stage: 'OBSERVE',
        buttonLabel: 'Give me a stronger hint',
        observation: 'Notice that both R2 and R3 share the exact same top node (Node A) and bottom node (Node B).',
        question: 'When two resistors share both terminals so current splits between them, what kind of connection is that?',
      },
      {
        level: 2,
        stage: 'HINT',
        buttonLabel: 'One more hint',
        observation: 'R2 (6Ω) and R3 (3Ω) are in parallel, and that combined parallel pair is in series with R1 (4Ω).',
        question: 'How do you calculate the equivalent resistance R_23 of two resistors in parallel using the product-over-sum rule?',
        concept_reminder: 'For two parallel resistors: R_parallel = (R2 × R3) / (R2 + R3).',
      },
      {
        level: 3,
        stage: 'GUIDE',
        buttonLabel: 'Guide me through this step',
        observation: 'First combine R2 || R3 using (6 × 3) / (6 + 3), then add R1 (4Ω) in series.',
        question: 'What value do you get for R_23 = (6 × 3) / (6 + 3), and what is R_eq when you add R1 = 4Ω?',
        partial_guidance: 'Compute R_23 = 18 / 9 Ω first, then compute R_eq = R1 + R_23.',
      },
      {
        level: 4,
        stage: 'SOLUTION',
        buttonLabel: 'Show Solution',
        observation: 'Complete series-parallel reduction unlocked.',
        question: 'Can you see why combining the parallel branch first lowers the resistance between Node A and Node B?',
        explanation:
          'Because R2 and R3 share both Node A and Node B, they are in parallel. We reduce the parallel combination first before adding the series resistor R1.',
        steps: [
          'Identify that R2 (6Ω) and R3 (3Ω) are connected in parallel between Node A and Node B',
          'Calculate parallel resistance: R_23 = (R2 × R3) / (R2 + R3) = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω',
          'Add R1 (4Ω) in series with R_23: R_eq = R1 + R_23 = 4 Ω + 2 Ω = 6 Ω',
          'Optional total current check: I_total = 12 V / 6 Ω = 2 A',
        ],
      },
    ],
    sampleCorrectAnswerKeywords: ['parallel', 'r2 and r3', '2 ohm', '6 ohm', 'r_eq = 6', 'product over sum', 'split'],
    summary: {
      topic: 'Series vs. Parallel Resistor Networks',
      subject: 'Electronics',
      whatYouDidWell: [
        'Recognized how to apply Ohm’s Law (I = V / R_eq) once equivalent resistance is found',
        'Clearly labeled nodes and component values on the circuit diagram',
      ],
      whatYouDiscovered: [
        'Components that share both terminal nodes (Node A and Node B) are in parallel, not series',
        'Parallel branches must be reduced first ((R2·R3)/(R2+R3) = 2Ω) before adding series resistors (4Ω + 2Ω = 6Ω)',
      ],
      keyConceptTakeaway: 'Always inspect node connections to distinguish series paths (shared single node) from parallel branches (shared node pair).',
      hintsUsed: 1,
      maxHints: 4,
      solvedIndependently: true,
      finalStatus: 'Concept understood ✓',
    },
  },
  {
    id: 'demo-handwritten-algebra',
    title: 'Demo 4: Handwritten Distribution Sign Error',
    badge: 'Mathematics · Algebraic Manipulation',
    subject: 'Mathematics',
    topic: 'Distributive Property with Negative Coefficients',
    problemText: 'Expand and solve: 3(x - 4) - 2(x - 5) = 7',
    studentWorkSummary: 'Line 1: 3(x - 4) - 2(x - 5) = 7\nLine 2: 3x - 12 - 2x - 10 = 7\nLine 3: x - 22 = 7\nLine 4: x = 29',
    svgHandwrittenGenerator: () =>
      svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 440" width="680" height="440">
          <defs>
            <pattern id="grid4" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="440" fill="#FCFBF7"/>
          <rect width="680" height="440" fill="url(#grid4)"/>
          <line x1="64" y1="0" x2="64" y2="440" stroke="#FCA5A5" stroke-width="1.5"/>

          <text x="84" y="46" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#64748B">HANDWRITTEN NOTEBOOK SCAN</text>
          <text x="84" y="76" font-family="Fraunces, Georgia, serif" font-size="21" font-weight="600" fill="#0F172A">Solve:   3(x - 4) - 2(x - 5) = 7</text>
          <line x1="84" y1="94" x2="620" y2="94" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4"/>

          <text x="90" y="152" font-family="IBM Plex Mono, monospace" font-size="20" fill="#1E293B">Line 1:   3(x - 4) - 2(x - 5) = 7</text>
          
          <text x="90" y="218" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="600" fill="#0F172A">Line 2:   3x - 12 - 2x - 10 = 7</text>
          
          <text x="90" y="284" font-family="IBM Plex Mono, monospace" font-size="20" fill="#1E293B">Line 3:   (3x - 2x) + (-12 - 10) = 7</text>
          
          <text x="90" y="344" font-family="IBM Plex Mono, monospace" font-size="20" fill="#1E293B">Line 4:   x - 22 = 7   ⇒   x = 29</text>
        </svg>
      `),
    initialAnalysis: {
      problem_detected: true,
      subject: 'Mathematics',
      topic: 'Distributive Property & Negative Signs',
      problem_statement_extracted: 'Solve 3(x - 4) - 2(x - 5) = 7',
      student_attempt_extracted: '3(x - 4) - 2(x - 5) = 7 → 3x - 12 - 2x - 10 = 7 → x - 22 = 7 → x = 29',
      work_understood: true,
      image_clear: true,
      error_detected: true,
      error_type: 'Logic',
      error_investigation_prompt:
        'I can follow your work clearly through Line 4. In Line 2, check the sign when distributing -2 across the second term inside (x - 5).',
      suspicious_step_label: 'Line 2: - 2(x - 5) expanded as - 2x - 10',
      annotation_region: {
        x: 34,
        y: 44,
        width: 32,
        height: 12,
        label: 'Inspect sign in Line 2 expansion',
        stepReference: 'Line 2: - 2x - 10',
      },
      confidence: 0.97,
      assistance_level: 0,
      feedback: 'Your grouping of like terms in Line 3 and Line 4 is algebraically consistent with Line 2.',
      next_question: 'I can follow your work until Line 2. Can you check whether the sign changes when you multiply -2 by -5?',
      hint_available: true,
      solution_allowed: false,
    },
    initialContract: {
      stage: 'THINK',
      observation: 'You expanded 3(x - 4) into 3x - 12 accurately.',
      question: 'I can follow your work until Line 2. Can you check whether the sign changes when you multiply -2 by -5?',
      hint_available: true,
      next_action: 'Ask student to respond',
      solution_allowed: false,
      error_category: 'Calculation',
      error_investigation:
        'Look closely at the second bracket in Line 1: -2(x - 5). When distributing the negative factor -2 to both terms inside, what happens to the sign of 10?',
      annotation_region: {
        x: 34,
        y: 44,
        width: 32,
        height: 12,
        label: 'Inspect sign in Line 2 expansion',
        stepReference: 'Line 2: - 2x - 10',
      },
    },
    progressiveHints: [
      {
        level: 0,
        stage: 'THINK',
        buttonLabel: 'Need a Hint?',
        observation: 'You expanded the first bracket 3(x - 4) = 3x - 12 properly.',
        question: 'I can follow your work until Line 2. Can you check whether the sign changes when you multiply -2 by -5?',
      },
      {
        level: 1,
        stage: 'OBSERVE',
        buttonLabel: 'Give me a stronger hint',
        observation: 'In Line 2, you wrote "- 2x - 10" for the expansion of -2(x - 5).',
        question: 'What is the product of two negative numbers: (-2) × (-5)?',
      },
      {
        level: 2,
        stage: 'HINT',
        buttonLabel: 'One more hint',
        observation: 'Multiplying a negative number by a negative number produces a positive product.',
        question: 'If (-2) × (-5) = +10, how should Line 2 be written?',
        concept_reminder: 'Distributive Law with negatives: -a(b - c) = -ab + ac.',
      },
      {
        level: 3,
        stage: 'GUIDE',
        buttonLabel: 'Guide me through this step',
        observation: 'With +10 in Line 2, the equation becomes 3x - 12 - 2x + 10 = 7.',
        question: 'Combine the constants (-12 + 10) in Line 3. What simplified equation do you get for x?',
        partial_guidance: 'Rewrite Line 2 as 3x - 12 - 2x + 10 = 7, combine 3x - 2x and -12 + 10, then solve for x.',
      },
      {
        level: 4,
        stage: 'SOLUTION',
        buttonLabel: 'Show Solution',
        observation: 'Complete step-by-step algebraic solution unlocked.',
        question: 'See how changing -10 to +10 shifts the constant combine step from -22 to -2?',
        explanation:
          'When distributing -2 across (x - 5), multiplying -2 by -5 yields +10 rather than -10.',
        steps: [
          'Start with: 3(x - 4) - 2(x - 5) = 7',
          'Distribute both factors carefully: 3x - 12 - 2x + 10 = 7',
          'Combine like terms (3x - 2x = x and -12 + 10 = -2): x - 2 = 7',
          'Add 2 to both sides: x = 9',
          'Check: 3(9 - 4) - 2(9 - 5) = 3(5) - 2(4) = 15 - 8 = 7 ✓',
        ],
      },
    ],
    sampleCorrectAnswerKeywords: ['+10', '+ 10', 'positive 10', 'plus 10', 'x - 2 = 7', 'x = 9', 'x=9', 'positive'],
    summary: {
      topic: 'Distributive Property with Negative Coefficients',
      subject: 'Mathematics',
      whatYouDidWell: [
        'Expanded the first parenthetical term 3(x - 4) accurately',
        'Grouped x-terms and constant terms systematically on the left-hand side',
      ],
      whatYouDiscovered: [
        'When distributing a negative coefficient like -2 across (x - 5), the negative sign applies to both terms: (-2)(-5) = +10',
        'Checking x = 9 in the original expression confirms 3(5) - 2(4) = 7',
      ],
      keyConceptTakeaway: 'Treat subtraction outside parentheses as distributing a negative factor: -a(b - c) = -ab + ac.',
      hintsUsed: 1,
      maxHints: 4,
      solvedIndependently: true,
      finalStatus: 'Concept understood ✓',
    },
  },
];
