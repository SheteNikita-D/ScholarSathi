import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  Layers,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  DocumentChunk,
  DocumentPageData,
  IngestionStepStatus,
  ScholarshipDocument,
} from '../types/scholarship';
import {
  deleteDocument,
  fetchAllDocuments,
  fetchDocumentChunks,
  generateSampleOfficialPdfFile,
  resetToSeedDocuments,
  uploadScholarshipPdf,
} from '../services/documentService';

interface AdminDocumentManagerProps {
  onDocumentCountChange?: (count: number) => void;
}

const PIPELINE_STEPS = [
  'Uploading',
  'Reading PDF',
  'Extracting pages',
  'Creating chunks',
  'Creating embeddings',
  'Indexing',
  'Ready',
] as const;

export const AdminDocumentManager: React.FC<AdminDocumentManagerProps> = ({
  onDocumentCountChange,
}) => {
  const [documents, setDocuments] = useState<ScholarshipDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [totalVectors, setTotalVectors] = useState<number>(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scholarshipName, setScholarshipName] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [issuingAuthority, setIssuingAuthority] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [sourceUrl, setSourceUrl] = useState<string>('');

  // Ingestion processing status
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStepStatus>({
    step: 'idle',
    message: '',
    progressPercent: 0,
  });
  const [activeStageIdx, setActiveStageIdx] = useState<number>(-1);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(
    null
  );

  // Inline Delete Confirmation state (avoids window.confirm in iframe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isResettingSeed, setIsResettingSeed] = useState<boolean>(false);

  // Inspector modal state
  const [inspectDocId, setInspectDocId] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<{
    document: ScholarshipDocument;
    pages: DocumentPageData[];
    chunks: DocumentChunk[];
  } | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState<boolean>(false);
  const [selectedInspectTab, setSelectedInspectTab] = useState<
    'chunks' | 'pages'
  >('chunks');
  const [chunkFilterSection, setChunkFilterSection] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const data = await fetchAllDocuments();
      setDocuments(data.documents);
      setTotalChunks(data.total_chunks);
      setTotalVectors(data.total_vectors ?? data.total_chunks);
      if (onDocumentCountChange) {
        onDocumentCountChange(data.total_documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (
      !file.name.toLowerCase().endsWith('.pdf') &&
      file.type !== 'application/pdf'
    ) {
      setUploadError(
        'Invalid format. Please select an official scholarship PDF document (.pdf).'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError(
        'File size exceeds 25MB limit. Please upload a smaller PDF.'
      );
      return;
    }

    setSelectedFile(file);

    if (!documentName) {
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      setDocumentName(cleanName);
    }
  };

  const handleLoadSamplePdf = () => {
    setUploadError(null);
    setUploadSuccessMessage(null);
    const sampleFile = generateSampleOfficialPdfFile();
    setSelectedFile(sampleFile);
    setScholarshipName('Maharashtra OBC Post-Matric Scholarship Scheme');
    setDocumentName('Official OBC Post-Matric Guidelines 2026-27');
    setIssuingAuthority('VJNT, OBC and SBC Welfare Department, Maharashtra');
    setAcademicYear('2026-27');
    setSourceUrl('https://mahadbt.maharashtra.gov.in/SchemeData/OBC-PostMatric');
  };

  const handleUploadAndProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (!selectedFile) {
      setUploadError('Please choose a PDF file to upload.');
      return;
    }

    if (!scholarshipName.trim()) {
      setUploadError('Please enter the Scholarship Name.');
      return;
    }

    if (!documentName.trim()) {
      setUploadError('Please enter the Document Name / Title.');
      return;
    }

    if (!sourceUrl.trim()) {
      setUploadError('Please provide the Official Source URL.');
      return;
    }

    try {
      setActiveStageIdx(0);
      setIngestionStatus({
        step: 'uploading',
        message: 'Uploading PDF file...',
        progressPercent: 15,
      });

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        setActiveStageIdx(2);
        setIngestionStatus({
          step: 'extracting_pages',
          message:
            'Reading PDF → Extracting pages → Creating chunks → Creating embeddings → Indexing...',
          progressPercent: 55,
        });

        try {
          const result = await uploadScholarshipPdf({
            pdfBase64: base64Data,
            scholarship_name: scholarshipName.trim(),
            document_name: documentName.trim(),
            issuing_authority:
              issuingAuthority.trim() || 'Government Authority',
            academic_year: academicYear.trim(),
            source_url: sourceUrl.trim(),
          });

          setActiveStageIdx(6);
          setIngestionStatus({
            step: 'ready',
            message: `Ready! Extracted ${result.pages_extracted} pages, created ${result.chunks_created} chunks, and indexed ${result.chunks_created} vector embeddings.`,
            progressPercent: 100,
          });

          setUploadSuccessMessage(
            `Document "${result.document.document_name}" is now Ready and immediately searchable (${result.pages_extracted} pages, ${result.chunks_created} chunks & embeddings).`
          );

          setSelectedFile(null);
          setScholarshipName('');
          setDocumentName('');
          setIssuingAuthority('');
          setSourceUrl('');
          if (fileInputRef.current) fileInputRef.current.value = '';

          await loadDocuments();
        } catch (err: any) {
          setActiveStageIdx(-1);
          setIngestionStatus({
            step: 'error',
            message: err.message || 'Unable to read this PDF.',
            progressPercent: 0,
          });
          setUploadError(err.message || 'Unable to read this PDF.');
        }
      };

      reader.onerror = () => {
        setUploadError('Unable to read this PDF.');
        setIngestionStatus({
          step: 'error',
          message: 'Unable to read this PDF.',
          progressPercent: 0,
        });
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setUploadError(err.message || 'Unable to read this PDF.');
      setIngestionStatus({
        step: 'error',
        message: 'Unable to read this PDF.',
        progressPercent: 0,
      });
    }
  };

  const handleConfirmDelete = async (docId: string, docName: string) => {
    try {
      await deleteDocument(docId);
      setConfirmDeleteId(null);
      setUploadSuccessMessage(
        `Deleted "${docName}" along with all its chunks and vector embeddings.`
      );
      await loadDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to delete document.');
    }
  };

  const handleInspect = async (docId: string) => {
    setInspectDocId(docId);
    setIsLoadingInspection(true);
    try {
      const data = await fetchDocumentChunks(docId);
      setInspectData(data);
    } catch (err: any) {
      setUploadError(`Failed to load chunks: ${err.message}`);
      setInspectDocId(null);
    } finally {
      setIsLoadingInspection(false);
    }
  };

  const handleResetToSeed = async () => {
    setIsResettingSeed(true);
    try {
      await resetToSeedDocuments();
      await loadDocuments();
      setUploadSuccessMessage(
        'Knowledge base restored to the 3 official verified scholarship guideline documents.'
      );
    } catch (err: any) {
      setUploadError(`Reset failed: ${err.message}`);
    } finally {
      setIsResettingSeed(false);
    }
  };

  const sectionsList = inspectData
    ? Array.from(new Set(inspectData.chunks.map((c) => c.section)))
    : [];

  const filteredChunks = inspectData
    ? inspectData.chunks.filter((c) =>
        chunkFilterSection === 'ALL' ? true : c.section === chunkFilterSection
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif-display font-semibold text-slate-900">
              Admin Document Manager
            </h1>
            <span className="text-xs font-mono text-emerald-800">
              · Real PDF → Chunks → Vector DB
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Upload official scholarship PDFs to extract page-preserved text, create section-aware chunks, and index vector embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isResettingSeed}
            onClick={handleResetToSeed}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${isResettingSeed ? 'animate-spin' : ''}`}
            />
            Restore Default Seed Documents
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Indexed Official Documents</span>
            <FileText className="w-4 h-4 text-sky-700" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            {documents.length}
          </p>
          <p className="text-xs text-slate-500">
            Verified government & AICTE PDFs
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Page-Aware Chunks & Vectors</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
            {totalChunks} Chunks · {totalVectors} Vectors
          </p>
          <p className="text-xs text-slate-500">
            Embedded once on ingestion for fast search
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>RAG Pipeline Status</span>
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-lg font-semibold text-emerald-800 flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Ready & Grounded
          </p>
          <p className="text-xs text-slate-500">
            Documents are the sole source of truth
          </p>
        </div>
      </div>

      {/* 1. REAL PDF UPLOAD CARD */}
      <section
        aria-label="Upload Official Scholarship PDF"
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <FileUp className="w-5 h-5 text-sky-700" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Upload Official Scholarship PDF Guideline
              </h2>
              <p className="text-xs text-slate-500">
                Upload a PDF from your device or click "Load Sample Official PDF" to test the full 7-step ingestion pipeline.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadSamplePdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-700" />
            Load Sample 2-Page Official PDF (OBC Scheme)
          </button>
        </div>

        <form onSubmit={handleUploadAndProcess} className="space-y-4">
          {/* Drag and drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-sky-600 bg-sky-50/40'
                : 'border-slate-300 hover:border-sky-600 bg-slate-50/50 hover:bg-sky-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-1.5">
                <FileCheck2 className="w-8 h-8 text-sky-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Valid PDF selected
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  Click to select a scholarship guideline PDF (.pdf)
                </p>
                <p className="text-xs text-slate-500">
                  Preserves exact page numbers (Page 1, Page 2...) and creates section-aware chunks
                </p>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Scholarship Scheme Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={scholarshipName}
                onChange={(e) => setScholarshipName(e.target.value)}
                placeholder="e.g. Government of India Post-Matric Scholarship"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Document Name / Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Official Scheme Guidelines 2026-27"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Issuing Authority / Department
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. Government of Maharashtra / AICTE"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
              >
                <option value="2026-27">2026–27 (Current / Latest)</option>
                <option value="2025-26">2025–26 (Previous Year)</option>
                <option value="2024-25">2024–25</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Official Source URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://mahadbt.maharashtra.gov.in/SchemeData/..."
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
              />
            </div>
          </div>

          {/* 7-Step Processing Pipeline Display (Section 1) */}
          {ingestionStatus.step !== 'idle' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  {ingestionStatus.step === 'ready' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : ingestionStatus.step === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-sky-700 animate-spin" />
                  )}
                  {ingestionStatus.message}
                </span>
                <span className="font-mono text-slate-600 tabular-nums">
                  {ingestionStatus.progressPercent}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 text-[11px] font-mono">
                {PIPELINE_STEPS.map((label, idx) => {
                  const done = activeStageIdx >= idx;
                  return (
                    <div
                      key={label}
                      className={`px-2 py-1.5 rounded border text-center truncate ${
                        done
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {done ? '✓ ' : ''}
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccessMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={
                !selectedFile ||
                ingestionStatus.step === 'uploading' ||
                ingestionStatus.step === 'extracting_pages'
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <FileUp className="w-4 h-4" />
              {ingestionStatus.step === 'uploading' ||
              ingestionStatus.step === 'extracting_pages'
                ? 'Processing PDF...'
                : 'Process, Chunk & Index PDF'}
            </button>
          </div>
        </form>
      </section>

      {/* 2. INDEXED DOCUMENTS TABLE (Section 16 & 17) */}
      <section
        aria-label="Indexed Documents"
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Indexed Documents ({documents.length})
            </h2>
            <p className="text-xs text-slate-500">
              Every document below is indexed in the vector store. Deleting a document removes its metadata, chunks, and embeddings immediately.
            </p>
          </div>
        </div>

        {isLoadingDocs ? (
          <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-sky-700" />
            Loading indexed documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-slate-500">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              No documents indexed yet.
            </p>
            <p className="text-xs">
              Upload an official scholarship PDF above or click "Restore Default Seed Documents".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-3 pr-4">Scholarship & Document</th>
                  <th className="py-3 px-4">Issuing Authority</th>
                  <th className="py-3 px-4 text-center">Academic Year</th>
                  <th className="py-3 px-4 text-right">Pages</th>
                  <th className="py-3 px-4 text-right">Chunks</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 pr-4 max-w-xs">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {doc.scholarship_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {doc.document_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                      {doc.issuing_authority}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700 tabular-nums">
                      {doc.academic_year}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {doc.page_count} pages
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 font-medium">
                      {doc.chunk_count} chunks
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Ready
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {doc.upload_date}
                    </td>
                    <td className="py-3.5 pl-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleInspect(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-50 rounded transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Inspect Chunks
                      </button>
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Open Official Source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {confirmDeleteId === doc.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmDelete(doc.id, doc.document_name)
                            }
                            className="px-2 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(doc.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Delete document, chunks & vectors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. INSPECT PAGES & CHUNKS MODAL */}
      {inspectDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>DOCUMENT & CHUNK INSPECTOR</span>
                  <span aria-hidden="true">·</span>
                  <span>{inspectData?.document.academic_year}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 truncate mt-0.5">
                  {inspectData?.document.document_name ||
                    'Loading Document Data...'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectDocId(null);
                  setInspectData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedInspectTab('chunks')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    selectedInspectTab === 'chunks'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Section-Aware Chunks ({inspectData?.chunks.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInspectTab('pages')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    selectedInspectTab === 'pages'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Extracted Raw Pages ({inspectData?.pages.length || 0})
                </button>
              </div>

              {selectedInspectTab === 'chunks' && sectionsList.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Filter Section:</span>
                  <select
                    value={chunkFilterSection}
                    onChange={(e) => setChunkFilterSection(e.target.value)}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ALL">
                      All Sections ({inspectData?.chunks.length})
                    </option>
                    {sectionsList.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {isLoadingInspection ? (
                <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-700" />
                  Loading chunk and page data...
                </div>
              ) : selectedInspectTab === 'chunks' ? (
                <div className="space-y-3">
                  {filteredChunks.map((chunk, index) => (
                    <div
                      key={chunk.chunk_id}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-semibold text-sky-800">
                            Chunk #{index + 1}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-emerald-800 font-semibold">
                            Page {chunk.page_number}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-slate-600 font-sans">
                            Section:{' '}
                            <strong className="text-slate-800">
                              {chunk.section}
                            </strong>
                          </span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                          {chunk.character_count} chars
                        </span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {inspectData?.pages.map((page) => (
                    <div
                      key={page.page_number}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-semibold font-mono text-slate-900">
                          PAGE {page.page_number}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                          {page.character_count} characters extracted
                        </span>
                      </div>
                      <pre className="text-slate-700 whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                        {page.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setInspectDocId(null);
                  setInspectData(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
