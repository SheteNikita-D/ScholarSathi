/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  Building2,
  FileCheck2,
  FileText,
  FileUp,
  GraduationCap,
  HelpCircle,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import {
  GroundedSourceCitation,
  ScholarshipDirectoryItem,
} from './types/scholarship';
import {
  ScholarshipDetailView,
  ScholarshipDirectoryView,
} from './components/ScholarshipDirectoryView';
import { AskScholarSaathiView } from './components/AskScholarSaathiView';
import { EligibilityCheckerView } from './components/EligibilityCheckerView';
import { AdminDocumentManager } from './components/AdminDocumentManager';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { SourceViewerModal } from './components/SourceViewerModal';
import { fetchAllDocuments } from './services/documentService';

type MainNavTab = 'directory' | 'ask' | 'eligibility' | 'admin' | 'evaluation';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Selected scholarship for detailed view
  const [selectedScholarship, setSelectedScholarship] =
    useState<ScholarshipDirectoryItem | null>(null);

  // Pre-filled question when transitioning from detail to QA
  const [prefilledQuestion, setPrefilledQuestion] = useState<string>('');

  // Source Viewer Modal State
  const [activeSourceModal, setActiveSourceModal] =
    useState<GroundedSourceCitation | null>(null);

  // Total documents count for badge
  const [indexedDocsCount, setIndexedDocsCount] = useState<number>(3);

  useEffect(() => {
    fetchAllDocuments().then((data) => {
      setIndexedDocsCount(data.total_documents || 3);
    });
  }, []);

  const handleAskAboutScholarship = (scholarshipName: string) => {
    setSelectedScholarship(null);
    setPrefilledQuestion(`What are the eligibility criteria and benefits for ${scholarshipName}?`);
    setActiveTab('ask');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* Top Bar Navigation Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Zone */}
          <button
            type="button"
            onClick={() => {
              setSelectedScholarship(null);
              setActiveTab('directory');
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif-display font-bold text-base">
              SS
            </div>
            <div>
              <span className="font-serif-display font-bold text-lg tracking-tight text-slate-900 block leading-none">
                SCHOLARSAATHI
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Verified Scholarship AI
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 text-xs font-semibold"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('directory');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'directory'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Discover Scholarships
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('ask');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'ask'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Ask ScholarSaathi
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('eligibility');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'eligibility'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Eligibility Checker
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('admin');
              }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Admin Document Manager</span>
              <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                {indexedDocsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('evaluation');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'evaluation'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Evaluation Dashboard (25 Qs)
            </button>
          </nav>

          {/* Right Action / Verified Trust Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Document Grounded</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-3 space-y-1">
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('directory');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Discover Scholarships
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('ask');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Ask ScholarSaathi
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('eligibility');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Eligibility Checker
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Admin Document Manager</span>
              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                {indexedDocsCount} Docs
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedScholarship(null);
                setActiveTab('evaluation');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Evaluation Dashboard
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'directory' && (
          <>
            {selectedScholarship ? (
              <ScholarshipDetailView
                scholarship={selectedScholarship}
                onBack={() => setSelectedScholarship(null)}
                onAskAboutScholarship={handleAskAboutScholarship}
              />
            ) : (
              <ScholarshipDirectoryView
                onSelectScholarship={(item) => setSelectedScholarship(item)}
                onAskAboutScholarship={handleAskAboutScholarship}
              />
            )}
          </>
        )}

        {activeTab === 'ask' && (
          <AskScholarSaathiView
            initialQuestion={prefilledQuestion}
            onOpenSourceModal={(src) => setActiveSourceModal(src)}
          />
        )}

        {activeTab === 'eligibility' && (
          <EligibilityCheckerView
            onOpenSourceModal={(src) => setActiveSourceModal(src)}
            onAskAboutScholarship={handleAskAboutScholarship}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDocumentManager
            onDocumentCountChange={(cnt) => setIndexedDocsCount(cnt)}
          />
        )}

        {activeTab === 'evaluation' && <EvaluationDashboard />}
      </main>

      {/* Source Viewer Modal */}
      <SourceViewerModal
        source={activeSourceModal}
        onClose={() => setActiveSourceModal(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="font-semibold text-slate-800">ScholarSaathi</span>
            <span aria-hidden="true">·</span>
            <span>Document-Grounded RAG Pipeline (Phase 2A)</span>
          </div>
          <p className="text-slate-400">
            Official Guidelines are the Source of Truth · No Hallucinated Eligibility
          </p>
        </div>
      </footer>
    </div>
  );
}
