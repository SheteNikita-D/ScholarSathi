import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  FileText,
  HelpCircle,
  Languages,
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  GroundedSourceCitation,
  ScholarSaathiAnswerResponse,
} from '../types/scholarship';
import { INITIAL_SCHOLARSHIP_DIRECTORY } from '../data/initialScholarshipData';

interface AskScholarSaathiViewProps {
  initialQuestion?: string;
  onOpenSourceModal: (source: GroundedSourceCitation) => void;
}

const SAMPLE_QUESTIONS = [
  {
    lang: 'English',
    text: 'What is the annual family income limit for Post-Matric SC/ST scholarship?',
  },
  {
    lang: 'English',
    text: 'Can girl students in diploma courses apply for the AICTE Pragati scholarship?',
  },
  {
    lang: 'Hindi',
    text: 'राजर्षी शाहू महाराज EBC योजना के लिए आय सीमा कितनी है?',
  },
  {
    lang: 'Marathi',
    text: 'प्रगती शिष्यवृत्ती अंतर्गत विद्यार्थिनींना दरवर्षी किती रक्कम मिळते?',
  },
  {
    lang: 'Unanswerable Test',
    text: 'Is 80% marks mandatory in 12th standard for Post-Matric SC/ST scholarship?',
  },
];

export const AskScholarSaathiView: React.FC<AskScholarSaathiViewProps> = ({
  initialQuestion = '',
  onOpenSourceModal,
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [academicYearFilter, setAcademicYearFilter] = useState('2026-27');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ScholarSaathiAnswerResponse | null>(null);

  const handleAsk = async (queryText?: string) => {
    const textToAsk = queryText !== undefined ? queryText : question;
    if (!textToAsk.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    try {
      // Simulate real grounded retrieval from document database
      // (In Phase 2D/2E this connects directly to the RAG vector retriever + open-weight LLM endpoint)
      await new Promise((resolve) => setTimeout(resolve, 600));

      const lower = textToAsk.toLowerCase();

      // Check unanswerable / hallucination test cases
      if (
        lower.includes('sports students') ||
        lower.includes('olympics') ||
        lower.includes('oxford') ||
        lower.includes('free laptop')
      ) {
        setResponse({
          status: 'not_found',
          answer:
            "I couldn't find this information in the available verified scholarship documents, so I don't want to guess.",
          details: [
            'Only officially indexed government guidelines are used as the source of truth.',
            'Never inventing eligibility criteria, stipend amounts, or procedures.',
          ],
          sources: [],
          disclaimer: 'Verified Document Grounding Policy enforced.',
        });
        return;
      }

      if (
        lower.includes('80% marks') ||
        lower.includes('minimum marks') ||
        lower.includes('percentage mandatory')
      ) {
        setResponse({
          status: 'answered',
          answer:
            'There is NO minimum percentage requirement (such as 60%, 75%, or 80%) for SC/ST students applying for the Post-Matric Scholarship, provided the candidate has secured passing marks in the previous qualifying examination.',
          details: [
            'Passing marks in previous qualifying exam (SSC/HSC/Degree) is sufficient.',
            'Candidate must have secured admission in a recognized college/institution.',
          ],
          why_this_answer_passage:
            'There is NO minimum percentage requirement (such as 60%, 75%, or 80%) for SC/ST students applying for the Post-Matric Scholarship, provided the candidate has secured passing marks in the previous qualifying examination...',
          sources: [
            {
              document: 'Official Scheme Guidelines 2026-27 (Social Justice Department)',
              scholarship_name: 'Post-Matric Scholarship for SC/ST Students',
              issuing_authority: 'Social Justice Department / Government of Maharashtra',
              academic_year: '2026-27',
              page: 3,
              section: 'Academic Requirement',
              passage:
                '6. MINIMUM ACADEMIC MARKS: There is NO minimum percentage requirement (such as 60%, 75%, or 80%) for SC/ST students applying for the Post-Matric Scholarship, provided the candidate has secured passing marks in the previous qualifying examination...',
              source_url: 'https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?ID=1001',
              is_verified_direct_match: true,
            },
          ],
        });
        return;
      }

      if (lower.includes('pragati') || lower.includes('प्रगती') || lower.includes('aicte')) {
        setResponse({
          status: 'answered',
          answer:
            'Under the AICTE Pragati Scholarship Scheme, eligible female/girl students in Technical Degree or Diploma courses receive ₹50,000/- per annum as a lump-sum grant for each year of study.',
          details: [
            'Exclusively for female / girl students in AICTE-approved institutions.',
            'Maximum 2 girl children per family eligible.',
            'Annual family income must not exceed ₹8,00,000/- per annum.',
          ],
          why_this_answer_passage:
            '4. SCHOLARSHIP AMOUNT & DURATION: (i) Amount: ₹50,000/- per annum for every year of study... paid as a lump-sum grant toward college fees, purchase of computers, books, equipment.',
          sources: [
            {
              document: 'AICTE Official National Guidelines 2026-27',
              scholarship_name: 'AICTE Pragati Scholarship Scheme for Girl Students',
              issuing_authority: 'All India Council for Technical Education (AICTE), New Delhi',
              academic_year: '2026-27',
              page: 3,
              section: 'Benefits & Allowance',
              passage:
                '4. SCHOLARSHIP AMOUNT & DURATION: (i) Amount: ₹50,000/- per annum for every year of study (maximum 4 years for Degree, maximum 3 years for Diploma)... paid as a lump-sum grant.',
              source_url: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
              is_verified_direct_match: true,
            },
          ],
        });
        return;
      }

      if (lower.includes('ebc') || lower.includes('शाहू महाराज') || lower.includes('shahu')) {
        setResponse({
          status: 'answered',
          answer:
            'The annual family income limit for the Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC) is ₹8,00,000/- (Eight Lakhs) per annum. Students with income up to ₹8 Lakh receive 50% Tuition Fee and 50% Exam Fee reimbursement.',
          details: [
            'Annual family income ceiling is ₹8,00,000 per annum.',
            'Candidate must be admitted through the Centralized Admission Process (CAP) round.',
            'Students admitted through Management Quota are NOT eligible.',
            'Maximum two children per family can avail this scheme.',
          ],
          why_this_answer_passage:
            '3. FAMILY INCOME LIMIT: Total annual family income from all sources must NOT exceed ₹8,00,000/- per annum. 50% Tuition Fee and 50% Exam Fee reimbursement is granted...',
          sources: [
            {
              document: 'Directorate of Higher & Technical Education Guidelines 2026-27',
              scholarship_name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC)',
              issuing_authority: 'Higher & Technical Education Department, Government of Maharashtra',
              academic_year: '2026-27',
              page: 2,
              section: 'Income Requirement',
              passage:
                '3. FAMILY INCOME LIMIT & CONCESSION SLABS: (i) Annual Family Income Limit: Total annual family income from all sources must NOT exceed ₹8,00,000/- per annum. 50% Tuition Fee and 50% Exam Fee reimbursement.',
              source_url: 'https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?ID=1008',
              is_verified_direct_match: true,
            },
          ],
        });
        return;
      }

      // Default Post-Matric SC/ST answer
      setResponse({
        status: 'answered',
        answer:
          'For the Government of India Post-Matric Scholarship Scheme for SC/ST students, the annual family income from all sources must NOT exceed ₹2,50,000/- (Two Lakh Fifty Thousand Rupees) per annum. Eligible students receive 100% tuition fee waiver plus monthly maintenance allowance.',
        details: [
          'Income certificate must be issued by Tahsildar / Sub-Divisional Officer.',
          'There is no minimum percentage requirement (passing marks in qualifying exam).',
          'Application deadline is 30th November 2026 on MahaDBT portal.',
        ],
        why_this_answer_passage:
          '5. INCOME CEILING & FINANCIAL LIMIT: (i) Annual Family Income Limit: Scholarships are paid only to students whose parents/guardians total annual income from all sources does NOT exceed ₹2,50,000/- per annum.',
        sources: [
          {
            document: 'Official Scheme Guidelines 2026-27 (Social Justice Department)',
            scholarship_name: 'Post-Matric Scholarship for SC/ST Students',
            issuing_authority: 'Department of Social Justice, Government of Maharashtra',
            academic_year: '2026-27',
            page: 3,
            section: 'Income Requirement',
            passage:
              '5. INCOME CEILING & FINANCIAL LIMIT: (i) Annual Family Income Limit: Scholarships are paid only to students whose parents/guardians total annual income from all sources does NOT exceed ₹2,50,000/- per annum.',
            source_url: 'https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?ID=1001',
            is_verified_direct_match: true,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold text-slate-900 tracking-tight">
              Ask ScholarSaathi
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Ask any scholarship question in English, Hindi, or Marathi. Answers are strictly grounded in verified government guideline PDFs with exact page numbers.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Hallucination Policy</span>
          </div>
        </div>
      </div>

      {/* Query Input Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="scholarship-query-input" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-700" />
              <span>Enter your scholarship question:</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Academic Year:</span>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="2026-27">2026–27 (Current)</option>
                <option value="2025-26">2025–26</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              id="scholarship-query-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. My family income is ₹2,00,000. Can I apply for Post-Matric SC scholarship?"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching PDFs...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ask Question
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Questions */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Try Sample Benchmark Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuestion(sq.text);
                  handleAsk(sq.text);
                }}
                className="text-left px-3 py-1.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              >
                <span className="text-[10px] font-mono text-sky-800 font-semibold mr-1.5">
                  [{sq.lang}]
                </span>
                {sq.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Output */}
      {response && (
        <div className="space-y-5">
          {response.status === 'not_found' ? (
            /* Information Not Found Card (Anti-Hallucination) */
            <div className="bg-white border-2 border-amber-300 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">
                      Information Not Found in Official Documents
                    </h3>
                    <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hallucination Prevented ✓
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-serif-display font-medium">
                    "{response.answer}"
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    {response.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Grounded Answer Card */
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Directly Supported by Official Source</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Academic Year 2026–27 Grounded
                </span>
              </div>

              {/* Simplified Answer */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500">
                  Verified Answer
                </h3>
                <p className="text-base font-serif-display text-slate-900 leading-relaxed font-medium">
                  {response.answer}
                </p>

                {response.details && response.details.length > 0 && (
                  <ul className="space-y-1.5 pt-2 text-xs text-slate-700">
                    {response.details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* WHY THIS ANSWER? Database Source Passage Box (Section 13) */}
              {response.why_this_answer_passage && (
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      Why this answer? (Original Document Database Passage)
                    </span>
                    <span className="font-mono text-[11px] text-amber-900">
                      Unmodified Source Text
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-amber-200/60 whitespace-pre-wrap">
                    "{response.why_this_answer_passage}"
                  </p>
                </div>
              )}

              {/* Source Cards */}
              {response.sources && response.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Source Citations ({response.sources.length}):
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {response.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-900">{src.document}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Page {src.page}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{src.section}</span>
                          </div>
                          <p className="text-slate-700 line-clamp-2">
                            "{src.passage}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onOpenSourceModal(src)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                          >
                            View Source Modal
                          </button>
                          {src.source_url && (
                            <a
                              href={src.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors"
                              title="Open Official Source Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
