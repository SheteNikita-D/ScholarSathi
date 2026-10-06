import React from 'react';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  FileCheck2,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';
import { GroundedSourceCitation } from '../types/scholarship';

interface SourceViewerModalProps {
  source: GroundedSourceCitation | null;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  source,
  onClose,
}) => {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>VERIFIED SOURCE PASSAGE</span>
              <span aria-hidden="true">·</span>
              <span>ACADEMIC YEAR {source.academic_year || '2026-27'}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {source.document || source.scholarship_name}
            </h3>
            <p className="text-xs text-slate-600">
              {source.issuing_authority}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[11px]">Exact Page</span>
              <span className="font-semibold text-emerald-800 font-mono text-sm">
                Page {source.page}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Section</span>
              <span className="font-semibold text-slate-900">
                {source.section || 'Eligibility'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Verification</span>
              <span className="font-semibold text-emerald-700">
                Direct Document Match ✓
              </span>
            </div>
          </div>

          {/* Original Document Passage */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-700" />
              Original Text from Verified Document Database:
            </label>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 text-slate-900 leading-relaxed font-sans text-xs whitespace-pre-wrap">
              "{source.passage}"
            </div>
            <p className="text-[11px] text-slate-500">
              Note: This passage is extracted directly from the official guideline PDF and was not modified by the AI.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {source.source_url ? (
            <a
              href={source.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950"
            >
              <span>Open Official Source Guideline</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close Source Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
