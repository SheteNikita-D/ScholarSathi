import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  HelpCircle,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  EligibilityProfile,
  GroundedSourceCitation,
  RequirementEvaluation,
} from '../types/scholarship';
import { INITIAL_SCHOLARSHIP_DIRECTORY } from '../data/initialScholarshipData';

interface EligibilityCheckerViewProps {
  onOpenSourceModal: (source: GroundedSourceCitation) => void;
  onAskAboutScholarship: (scholarshipName: string) => void;
}

export const EligibilityCheckerView: React.FC<EligibilityCheckerViewProps> = ({
  onOpenSourceModal,
  onAskAboutScholarship,
}) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    INITIAL_SCHOLARSHIP_DIRECTORY[0].id
  );

  const [profile, setProfile] = useState<EligibilityProfile>({
    education_level: 'Undergraduate',
    annual_family_income: 200000,
    caste_category: 'SC',
    percentage_or_cgpa: 72,
    domicile_state: 'Maharashtra',
    gender: 'Female',
  });

  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [evaluations, setEvaluations] = useState<RequirementEvaluation[]>([]);

  const activeScheme =
    INITIAL_SCHOLARSHIP_DIRECTORY.find((s) => s.id === selectedSchemeId) ||
    INITIAL_SCHOLARSHIP_DIRECTORY[0];

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasEvaluated(true);

    const results: RequirementEvaluation[] = [];

    // 1. Income Requirement Evaluation
    if (selectedSchemeId === 'post-matric-sc-st') {
      const isIncomeMatched = profile.annual_family_income <= 250000;
      results.push({
        requirement_name: 'Annual Family Income Limit (₹2.5 Lakh)',
        category: 'Income',
        status: isIncomeMatched ? 'matched' : 'not_matched',
        student_value: `₹${profile.annual_family_income.toLocaleString('en-IN')}`,
        official_criteria: 'Total annual family income must not exceed ₹2,50,000/- per annum.',
        source_page: 3,
        source_document: 'Official Scheme Guidelines 2026-27 (Social Justice Department)',
        explanation: isIncomeMatched
          ? `Your income of ₹${profile.annual_family_income.toLocaleString('en-IN')} satisfies the official limit of ₹2,50,000.`
          : `Your income exceeds the scheme limit of ₹2,50,000.`,
      });

      // Category
      const isCategoryMatched = profile.caste_category === 'SC' || profile.caste_category === 'ST';
      results.push({
        requirement_name: 'Caste Category (SC / ST)',
        category: 'Category',
        status: isCategoryMatched ? 'matched' : 'not_matched',
        student_value: profile.caste_category,
        official_criteria: 'Must belong strictly to Scheduled Caste (SC) or Scheduled Tribe (ST) communities.',
        source_page: 2,
        source_document: 'Official Scheme Guidelines 2026-27',
        explanation: isCategoryMatched
          ? `Your category (${profile.caste_category}) is eligible for 100% tuition waiver.`
          : `This scheme is exclusively for SC/ST students.`,
      });

      // Minimum Marks
      results.push({
        requirement_name: 'Academic Marks / Percentage Criteria',
        category: 'Marks',
        status: 'matched',
        student_value: `${profile.percentage_or_cgpa}%`,
        official_criteria: 'No minimum percentage required (passing marks in qualifying examination).',
        source_page: 3,
        source_document: 'Official Scheme Guidelines 2026-27',
        explanation: `With ${profile.percentage_or_cgpa}%, you meet the passing requirement.`,
      });

      // Domicile
      const isDomicileMatched = profile.domicile_state.toLowerCase().includes('maha');
      results.push({
        requirement_name: 'State Domicile Requirement',
        category: 'Domicile',
        status: isDomicileMatched ? 'matched' : 'not_matched',
        student_value: profile.domicile_state,
        official_criteria: 'Must be a permanent resident / domicile of Maharashtra.',
        source_page: 2,
        source_document: 'Official Scheme Guidelines 2026-27',
        explanation: isDomicileMatched
          ? 'Domicile requirement is satisfied.'
          : 'Applicant must have Maharashtra domicile.',
      });
    } else if (selectedSchemeId === 'rajarshi-shahu-maharaj-ebc') {
      const isIncomeMatched = profile.annual_family_income <= 800000;
      results.push({
        requirement_name: 'Annual Family Income Limit (₹8.0 Lakh)',
        category: 'Income',
        status: isIncomeMatched ? 'matched' : 'not_matched',
        student_value: `₹${profile.annual_family_income.toLocaleString('en-IN')}`,
        official_criteria: 'Total annual family income must not exceed ₹8,00,000/- per annum.',
        source_page: 2,
        source_document: 'Directorate of Higher & Technical Education Guidelines 2026-27',
        explanation: isIncomeMatched
          ? `Income of ₹${profile.annual_family_income.toLocaleString('en-IN')} is within the ₹8,00,000 ceiling (qualifies for 50% tuition waiver).`
          : `Income exceeds ₹8,00,000 ceiling.`,
      });

      const isCategoryMatched = ['Open / General', 'EWS', 'OBC'].includes(profile.caste_category);
      results.push({
        requirement_name: 'Beneficiary Category (EBC / General / Open)',
        category: 'Category',
        status: isCategoryMatched ? 'matched' : 'not_matched',
        student_value: profile.caste_category,
        official_criteria: 'Open/General/EBC candidates not availing other caste scholarships.',
        source_page: 1,
        source_document: 'Directorate of Higher & Technical Education Guidelines 2026-27',
        explanation: isCategoryMatched
          ? 'Eligible under Economically Backward Class (EBC) fee concession.'
          : 'Reserved category students should apply under their respective departmental scheme.',
      });

      results.push({
        requirement_name: 'Minimum Percentage Threshold',
        category: 'Marks',
        status: 'not_mentioned',
        student_value: `${profile.percentage_or_cgpa}%`,
        official_criteria: 'Not specified as a cutoff; 75% attendance and regular exam appearance mandatory.',
        source_page: 2,
        source_document: 'Directorate of Higher & Technical Education Guidelines 2026-27',
        explanation: 'Document specifies 75% attendance rather than a strict marks percentage cutoff.',
      });
    } else {
      // AICTE Pragati
      const isGenderMatched = profile.gender === 'Female';
      results.push({
        requirement_name: 'Gender Requirement (Female Only)',
        category: 'Gender',
        status: isGenderMatched ? 'matched' : 'not_matched',
        student_value: profile.gender,
        official_criteria: 'Exclusively for female / girl students.',
        source_page: 1,
        source_document: 'AICTE Official National Guidelines 2026-27',
        explanation: isGenderMatched
          ? 'Gender criteria matched (girl student).'
          : 'AICTE Pragati is exclusively for girl students.',
      });

      const isIncomeMatched = profile.annual_family_income <= 800000;
      results.push({
        requirement_name: 'Annual Family Income Limit (₹8.0 Lakh)',
        category: 'Income',
        status: isIncomeMatched ? 'matched' : 'not_matched',
        student_value: `₹${profile.annual_family_income.toLocaleString('en-IN')}`,
        official_criteria: 'Family income must not exceed ₹8,00,000 per annum.',
        source_page: 2,
        source_document: 'AICTE Official National Guidelines 2026-27',
        explanation: isIncomeMatched
          ? 'Income criteria satisfied (₹50,000/yr lump-sum grant).'
          : 'Income exceeds ₹8,00,000 ceiling.',
      });
    }

    setEvaluations(results);
  };

  const allMatched = evaluations.length > 0 && evaluations.every((e) => e.status !== 'not_matched');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold text-slate-900 tracking-tight">
              Personalized Eligibility Checker
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter your student details to evaluate eligibility against verified official scholarship requirements without guesswork.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Document-Grounded Evaluation</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Select Target Scholarship Scheme:
            </label>
            <select
              value={selectedSchemeId}
              onChange={(e) => {
                setSelectedSchemeId(e.target.value);
                setHasEvaluated(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
            >
              {INITIAL_SCHOLARSHIP_DIRECTORY.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Education Level
              </label>
              <select
                value={profile.education_level}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    education_level: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="Undergraduate">Undergraduate (Degree)</option>
                <option value="Diploma">Diploma (Technical/Polytechnic)</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Class 11-12">Class 11–12 (Junior College)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={profile.annual_family_income}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    annual_family_income: Number(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Caste Category
              </label>
              <select
                value={profile.caste_category}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    caste_category: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="Open / General">Open / General</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
                <option value="VJNT">VJNT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Marks / Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={profile.percentage_or_cgpa}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    percentage_or_cgpa: Number(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Domicile State
              </label>
              <input
                type="text"
                value={profile.domicile_state}
                onChange={(e) =>
                  setProfile({ ...profile, domicile_state: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value as any })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              Check Eligibility Against Document
            </button>
          </div>
        </form>
      </div>

      {/* Evaluation Results Card */}
      {hasEvaluated && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Eligibility Evaluation Result
                </h3>
                {allMatched ? (
                  <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    Eligible to Apply ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                    Requirement Mismatch Detected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against {activeScheme.name}
              </p>
            </div>
          </div>

          {/* Requirements Breakdown List */}
          <div className="space-y-3">
            {evaluations.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    {item.status === 'matched' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : item.status === 'not_matched' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900">
                      Requirement #{idx + 1}: {item.requirement_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        item.status === 'matched'
                          ? 'bg-emerald-100 text-emerald-900'
                          : item.status === 'not_matched'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.status === 'matched'
                        ? 'Matched ✓'
                        : item.status === 'not_matched'
                        ? 'Not Matched ✗'
                        : 'Not Mentioned in Document'}
                    </span>
                    {item.source_page && (
                      <span className="text-slate-500">
                        (Page {item.source_page})
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Your Value</span>
                    <span className="font-semibold text-slate-900">{item.student_value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Guideline Rule</span>
                    <span>{item.official_criteria}</span>
                  </div>
                </div>

                <p className="text-slate-600 pt-1 border-t border-slate-200/40 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onAskAboutScholarship(activeScheme.name)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950"
            >
              <span>Ask AI more questions about this scholarship</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
