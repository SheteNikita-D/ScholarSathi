export interface ScholarshipDocument {
  id: string;
  scholarship_name: string;
  document_name: string;
  issuing_authority: string;
  academic_year: string;
  source_url: string;
  upload_date: string;
  page_count: number;
  chunk_count: number;
  status: 'ready' | 'processing' | 'error';
  file_size_bytes: number;
  error_message?: string;
  pages?: DocumentPageData[];
}

export interface DocumentPageData {
  page_number: number;
  text: string;
  character_count: number;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  scholarship_name: string;
  document_name: string;
  issuing_authority: string;
  academic_year: string;
  page_number: number;
  page_end_number?: number;
  section:
    | 'Eligibility'
    | 'Income Requirement'
    | 'Academic Requirement'
    | 'Benefits & Allowance'
    | 'Required Documents'
    | 'Application Process'
    | 'Important Dates'
    | 'Renewal Criteria'
    | 'Restrictions & Quota'
    | 'General Information';
  text: string;
  source_url: string;
  character_count: number;
}

export interface IngestionStepStatus {
  step:
    | 'idle'
    | 'uploading'
    | 'reading_pdf'
    | 'extracting_pages'
    | 'creating_chunks'
    | 'indexing'
    | 'ready'
    | 'error';
  message: string;
  progressPercent: number;
}

export interface IngestionResult {
  success: boolean;
  document: ScholarshipDocument;
  pages_extracted: number;
  chunks_created: number;
  sample_chunks: DocumentChunk[];
  error?: string;
}

export interface GroundedSourceCitation {
  document: string;
  scholarship_name: string;
  issuing_authority: string;
  academic_year: string;
  page: number;
  section: string;
  passage: string;
  source_url: string;
  relevance_score?: number;
  is_verified_direct_match?: boolean;
}

export interface ScholarSaathiAnswerResponse {
  status: 'answered' | 'not_found' | 'partial' | 'conflicting';
  answer: string;
  details: string[];
  sources: GroundedSourceCitation[];
  why_this_answer_passage?: string;
  disclaimer?: string;
  academic_year_context?: string;
  language?: 'en' | 'hi' | 'mr';
}

export interface EligibilityProfile {
  education_level: 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'School (Class 9-10)' | 'Class 11-12' | 'Doctoral / Ph.D.';
  annual_family_income: number;
  caste_category: 'Open / General' | 'OBC' | 'SC' | 'ST' | 'VJNT' | 'SBC' | 'EWS' | 'Minority';
  percentage_or_cgpa: number;
  domicile_state: string;
  gender: 'Female' | 'Male' | 'Other';
}

export interface RequirementEvaluation {
  requirement_name: string;
  category: 'Income' | 'Education' | 'Marks' | 'Category' | 'Domicile' | 'Gender';
  status: 'matched' | 'not_matched' | 'not_mentioned';
  student_value: string;
  official_criteria: string;
  source_page?: number;
  source_document?: string;
  explanation: string;
}

export interface ScholarshipDirectoryItem {
  id: string;
  name: string;
  short_code: string;
  issuing_authority: string;
  academic_year: string;
  category_target: string[];
  education_levels: string[];
  income_limit_text: string;
  benefit_amount_text: string;
  deadline_text: string;
  source_url: string;
  document_id?: string;
  description: string;
  eligibility_summary: string[];
  required_documents_summary: string[];
}

export interface EvaluationTestCase {
  id: number;
  category: string;
  question: string;
  language: 'en' | 'hi' | 'mr';
  expected_answer: string;
  expected_source: string;
  expected_page: number;
  answerable: boolean;
  actual_answer?: string;
  actual_source?: string;
  actual_page?: number;
  passed?: boolean;
  hallucinated?: boolean;
  retrieval_matched?: boolean;
  refusal_correct?: boolean;
}

export interface EvaluationMetricsSummary {
  total_questions: number;
  answer_accuracy_percent: number;
  source_accuracy_percent: number;
  retrieval_accuracy_percent: number;
  not_found_accuracy_percent: number;
  hallucination_rate_percent: number;
  tested_at?: string;
}
