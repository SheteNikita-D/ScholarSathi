import {
  DocumentChunk,
  DocumentPageData,
  EligibilityProfile,
  EvaluationTestCase,
  GroundedSourceCitation,
  IngestionResult,
  RequirementEvaluation,
  ScholarSaathiAnswerResponse,
  ScholarshipDocument,
} from '../types/scholarship';

export async function fetchAllDocuments(): Promise<{
  documents: ScholarshipDocument[];
  total_documents: number;
  total_chunks: number;
  total_vectors?: number;
  embedding_model?: string;
  llm_model?: string;
  relevance_threshold?: number;
}> {
  try {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    return await res.json();
  } catch (err) {
    console.error('Error fetching documents:', err);
    return { documents: [], total_documents: 0, total_chunks: 0 };
  }
}

export async function fetchDocumentChunks(
  docId: string
): Promise<{
  document: ScholarshipDocument;
  pages: DocumentPageData[];
  chunks: DocumentChunk[];
}> {
  const res = await fetch(`/api/documents/${docId}/chunks`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch document chunks');
  }
  return await res.json();
}

export async function uploadScholarshipPdf(params: {
  pdfBase64: string;
  scholarship_name: string;
  document_name: string;
  issuing_authority: string;
  academic_year: string;
  source_url: string;
}): Promise<IngestionResult> {
  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Unable to read this PDF.');
  }

  return data;
}

export async function deleteDocument(
  docId: string
): Promise<{
  success: boolean;
  remaining_documents: number;
  remaining_chunks: number;
  removed_vectors?: number;
}> {
  const res = await fetch(`/api/documents/${docId}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete document');
  }
  return data;
}

export async function resetToSeedDocuments(): Promise<any> {
  const res = await fetch('/api/documents/reset-seed', {
    method: 'POST',
  });
  return await res.json();
}

export async function askScholarSaathiRag(params: {
  question: string;
  academicYear?: string;
  minThreshold?: number;
  scholarshipFilter?: string;
}): Promise<
  ScholarSaathiAnswerResponse & {
    model_used?: string;
    cached?: boolean;
    retrieval_diagnostics?: {
      chunks_retrieved: number;
      max_similarity: number;
      threshold_used: number;
      total_indexed_vectors: number;
    };
  }
> {
  const res = await fetch('/api/rag/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || 'The AI service is currently unavailable. Please try again.'
    );
  }
  return data;
}

export async function checkEligibilityRag(params: {
  scholarshipName: string;
  profile: EligibilityProfile;
  academicYear?: string;
}): Promise<{
  model_used: string;
  overall_status: 'eligible' | 'not_eligible' | 'insufficient_information';
  summary_message: string;
  evaluations: RequirementEvaluation[];
  sources: GroundedSourceCitation[];
}> {
  const res = await fetch('/api/rag/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || 'The AI service is currently unavailable. Please try again.'
    );
  }
  return data;
}

export async function evaluateBenchmarkTestCase(
  testCase: EvaluationTestCase
): Promise<EvaluationTestCase> {
  const res = await fetch('/api/rag/evaluate-case', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testCase }),
  });
  if (!res.ok) {
    throw new Error('Failed to evaluate test case');
  }
  const data = await res.json();
  return data.evaluatedCase;
}

/**
 * Generates a real, standards-compliant 2-page PDF file in memory (%PDF-1.4)
 * so admins can test the full binary PDF extraction + page preservation + vector indexing pipeline
 * with a single click or download/upload it.
 */
export function generateSampleOfficialPdfFile(): File {
  const page1Text =
    'GOVERNMENT OF MAHARASHTRA - OBC POST-MATRIC SCHOLARSHIP GUIDELINES 2026-27. ' +
    '1. ELIGIBILITY CRITERIA: Applicants must belong to Other Backward Class (OBC) category and be a permanent domicile of Maharashtra State. ' +
    'Eligible courses include Class 11, Class 12, Diploma, Undergraduate, and Postgraduate degrees in recognized colleges. ' +
    '2. ANNUAL FAMILY INCOME LIMIT: Total annual family income from all sources should NOT exceed Rs 1,50,000 for 100% maintenance allowance, or up to Rs 8,00,000 for 50% tuition fee reimbursement.';
  const page2Text =
    'PAGE 2 - BENEFITS AND REQUIRED DOCUMENTS (OBC POST-MATRIC SCHEME 2026-27). ' +
    '3. BENEFITS: Eligible OBC students receive 50% to 100% Tuition Fee and Examination Fee reimbursement via Direct Benefit Transfer (DBT). ' +
    '4. REQUIRED DOCUMENTS: (a) OBC Caste Certificate and Non-Creamy Layer (NCL) Certificate valid for 2026-27, (b) Tahsildar Income Certificate, (c) Maharashtra Domicile Certificate, (d) CAP Allotment Letter and Fee Receipt. ' +
    '5. IMPORTANT DATES: Application deadline on MahaDBT portal is 20th December 2026.';

  const stream1 = `BT /F1 11 Tf 40 720 Td (${page1Text.slice(0, 110)}) Tj 0 -20 Td (${page1Text.slice(110, 220)}) Tj 0 -20 Td (${page1Text.slice(220, 330)}) Tj 0 -20 Td (${page1Text.slice(330)}) Tj ET`;
  const stream2 = `BT /F1 11 Tf 40 720 Td (${page2Text.slice(0, 110)}) Tj 0 -20 Td (${page2Text.slice(110, 220)}) Tj 0 -20 Td (${page2Text.slice(220, 330)}) Tj 0 -20 Td (${page2Text.slice(330)}) Tj ET`;

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 7 0 R >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length ${stream1.length} >>
stream
${stream1}
endstream
endobj
7 0 obj
<< /Length ${stream2.length} >>
stream
${stream2}
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000121 00000 n 
0000000248 00000 n 
0000000375 00000 n 
0000000443 00000 n 
0000000800 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
1160
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return new File([blob], 'Maharashtra_OBC_Post_Matric_Guidelines_2026_27.pdf', {
    type: 'application/pdf',
  });
}
