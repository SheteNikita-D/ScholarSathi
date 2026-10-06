import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ScholarshipDirectoryItem } from '../types/scholarship';
import { INITIAL_SCHOLARSHIP_DIRECTORY } from '../data/initialScholarshipData';

interface ScholarshipDirectoryViewProps {
  onSelectScholarship: (item: ScholarshipDirectoryItem) => void;
  onAskAboutScholarship: (scholarshipName: string) => void;
}

export const ScholarshipDirectoryView: React.FC<ScholarshipDirectoryViewProps> = ({
  onSelectScholarship,
  onAskAboutScholarship,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEducation, setSelectedEducation] = useState('ALL');

  const filtered = INITIAL_SCHOLARSHIP_DIRECTORY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issuing_authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL'
        ? true
        : item.category_target.includes(selectedCategory);

    const matchesEducation =
      selectedEducation === 'ALL'
        ? true
        : item.education_levels.includes(selectedEducation);

    return matchesSearch && matchesCategory && matchesEducation;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold text-slate-900 tracking-tight">
              Verified Scholarship Directory
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore officially verified Central and State Government schemes with verified guidelines and direct portal links.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Official Guidelines Grounded</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship title, department, or keyword..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9.5 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="Open / General">Open / General (EBC)</option>
              <option value="OBC">OBC</option>
              <option value="EWS">EWS</option>
            </select>

            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="ALL">All Education Levels</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate (Degree)</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Class 11-12">Class 11–12 (Junior College)</option>
            </select>
          </div>
        </div>

        {/* Unboxed filter tags */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {filtered.length} verified schemes</span>
          <span aria-hidden="true">·</span>
          <span>Academic Year 2026–27</span>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                  <span className="font-semibold text-sky-800">{item.short_code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.academic_year}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {item.issuing_authority}
                </p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Income Limit</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {item.income_limit_text}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deadline</span>
                  <span className="font-semibold text-amber-800 font-mono">
                    {item.deadline_text}
                  </span>
                </div>
              </div>

              {/* Eligibility Bullets */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Key Requirements:
                </span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {item.eligibility_summary.slice(0, 2).map((el, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onAskAboutScholarship(item.name)}
                className="text-xs font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-1"
              >
                <span>Ask AI Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Open Official Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onSelectScholarship(item)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ScholarshipDetailViewProps {
  scholarship: ScholarshipDirectoryItem;
  onBack: () => void;
  onAskAboutScholarship: (name: string) => void;
}

export const ScholarshipDetailView: React.FC<ScholarshipDetailViewProps> = ({
  scholarship,
  onBack,
  onAskAboutScholarship,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents' | 'benefits'>('overview');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Title */}
      <div className="space-y-3 border-b border-slate-200 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
        >
          ← Back to Directory
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>{scholarship.short_code}</span>
              <span aria-hidden="true">·</span>
              <span>Academic Year {scholarship.academic_year}</span>
            </div>
            <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
              {scholarship.name}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {scholarship.issuing_authority}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scholarship.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onAskAboutScholarship(scholarship.name)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Ask AI About This Scheme
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('eligibility')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'eligibility'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Eligibility
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'benefits'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Benefits
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Scheme Summary</h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {scholarship.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Income Limit</span>
              <span className="font-semibold text-slate-900 font-mono text-sm">
                {scholarship.income_limit_text}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Financial Benefit</span>
              <span className="font-semibold text-emerald-800 font-mono text-sm">
                {scholarship.benefit_amount_text}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Application Deadline</span>
              <span className="font-semibold text-amber-800 font-mono text-sm">
                {scholarship.deadline_text}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'eligibility' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Verified Eligibility Criteria
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {scholarship.eligibility_summary.map((el, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{el}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Required Documents for Application
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {scholarship.required_documents_summary.map((doc, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Financial Benefits & Fee Concessions
          </h3>
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-semibold block">Official Benefit Structure:</span>
            <p className="leading-relaxed font-mono">{scholarship.benefit_amount_text}</p>
          </div>
        </div>
      )}
    </div>
  );
};
