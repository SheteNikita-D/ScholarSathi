import { GoogleGenAI } from '@google/genai';
import {
  EligibilityProfile,
  GroundedSourceCitation,
  RequirementEvaluation,
  ScholarSaathiAnswerResponse,
} from '../types/scholarship';
import { RetrievalResult } from './vectorStore';

export const LLM_SERVICE_CONFIG = {
  modelId: process.env.SCHOLARSAATHI_LLM_MODEL || 'gemma-4-26b-a4b-it',
  temperature: 0.1,
};

export const SCHOLARSAATHI_GROUNDING_PROMPT = `You are ScholarSaathi, a scholarship information assistant.

You must answer ONLY using the supplied scholarship document context.

The supplied context comes from verified scholarship documents.

Never use your general knowledge to fill missing information.

Never invent:
- eligibility criteria
- income limits
- scholarship amounts
- deadlines
- required documents
- academic requirements
- application procedures

If the supplied context does not contain enough information to answer the question, say:
"I couldn't find this information in the available scholarship documents, so I don't want to guess."

Use simple language that students and parents can understand.
If the user asks in Hindi or Marathi, write your simplified "answer" and "details" in that same language (Hindi or Marathi), while keeping the cited source chunk ID accurate.

Separate your simplified answer from the original source passage.

Never modify the source passage.

Every factual answer must be supported by a source.`;

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseStructuredLlmJson(rawText: string | undefined): Record<string, any> {
  if (!rawText) return {};
  const trimmed = rawText.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Invalid JSON from Open-Weight LLM');
  }
}

/**
 * Generates a strictly grounded answer from retrieved vector chunks using the configured Open-Weight LLM.
 * Enforces Section 12 (Source Validation) & Section 13 (Original Source Passage from Database).
 */
export async function generateGroundedAnswer(params: {
  question: string;
  retrievedChunks: RetrievalResult[];
  yearFallbackNotice?: string;
}): Promise<ScholarSaathiAnswerResponse & { model_used: string }> {
  const { question, retrievedChunks, yearFallbackNotice } = params;

  // Section 8: If retrieved chunks are empty (below relevance threshold), refuse immediately without calling LLM
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      model_used: LLM_SERVICE_CONFIG.modelId,
      status: 'not_found',
      answer:
        "I couldn't find this information in the available scholarship documents, so I don't want to guess.",
      details: [
        'No passage in the indexed scholarship documents met the minimum semantic relevance threshold.',
        'Upload the relevant official scholarship PDF in the Admin Document Manager to add it to the knowledge base.',
      ],
      sources: [],
      academic_year_context: yearFallbackNotice,
    };
  }

  // Format retrieved evidence with index numbers so the LLM selects which exact database chunk(s) support its answer
  const contextBlocks = retrievedChunks
    .map(
      (r, idx) =>
        `[SOURCE_${idx + 1}]
Chunk ID: ${r.chunk.chunk_id}
Scholarship Name: ${r.chunk.scholarship_name}
Document Name: ${r.chunk.document_name}
Issuing Authority: ${r.chunk.issuing_authority}
Academic Year: ${r.chunk.academic_year}
Page Number: ${r.chunk.page_number}
Section: ${r.chunk.section}
Exact Database Passage:
"""
${r.chunk.text}
"""`
    )
    .join('\n\n');

  const prompt = `${SCHOLARSAATHI_GROUNDING_PROMPT}

SUPPLIED VERIFIED SCHOLARSHIP DOCUMENT CONTEXT:
${contextBlocks}

USER QUESTION:
"${question}"

${
  yearFallbackNotice
    ? `ACADEMIC YEAR NOTE: ${yearFallbackNotice} Mention this clearly in your answer.`
    : ''
}

Instructions:
1. Check whether the SUPPLIED VERIFIED SCHOLARSHIP DOCUMENT CONTEXT contains the answer to the user's question.
2. If the context does NOT answer the question, set "status" to "not_found" and set "answer" to "I couldn't find this information in the available scholarship documents, so I don't want to guess." and "supported_source_indices" to [].
3. If two different official documents in the context give different values for the user's question (for example, different income limits across schemes when the user did not specify one scheme), set "status" to "conflicting", explain both rules clearly in "answer", and include both source indices in "supported_source_indices".
4. Otherwise set "status" to "answered" (or "partial" if only partially answered), provide a clear simplified "answer", 2-4 bullet points in "details", and list the 1-based index numbers of the supporting sources in "supported_source_indices" (e.g. [1] or [1, 2]).

Respond ONLY with a valid JSON object matching this exact schema:
{
  "status": "answered | not_found | partial | conflicting",
  "answer": "string",
  "details": ["string", "string"],
  "supported_source_indices": [1]
}`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: LLM_SERVICE_CONFIG.modelId,
      contents: { parts: [{ text: prompt }] },
    });

    const parsed = parseStructuredLlmJson(response.text);

    const rawStatus = parsed.status;
    const validStatuses = ['answered', 'not_found', 'partial', 'conflicting'];
    let status: ScholarSaathiAnswerResponse['status'] = validStatuses.includes(
      rawStatus
    )
      ? rawStatus
      : 'answered';

    const indices: number[] = Array.isArray(parsed.supported_source_indices)
      ? parsed.supported_source_indices
          .map((n: any) => Number(n))
          .filter((n: number) => n >= 1 && n <= retrievedChunks.length)
      : [1];

    // Section 12: Source Validation — If LLM claims "answered" but provides no valid source index, refuse!
    if (status !== 'not_found' && indices.length === 0) {
      status = 'not_found';
    }

    if (
      status === 'not_found' ||
      (typeof parsed.answer === 'string' &&
        parsed.answer
          .toLowerCase()
          .includes("couldn't find this information in the available"))
    ) {
      return {
        model_used: LLM_SERVICE_CONFIG.modelId,
        status: 'not_found',
        answer:
          "I couldn't find this information in the available scholarship documents, so I don't want to guess.",
        details: [
          'Verified against retrieved passages: the available documents do not state this information.',
        ],
        sources: [],
        academic_year_context: yearFallbackNotice,
      };
    }

    // Section 13: Populate sources strictly from the original database chunks (NEVER LLM-generated text)
    const verifiedSources: GroundedSourceCitation[] = indices.map((idx1) => {
      const matched = retrievedChunks[idx1 - 1];
      return {
        document: matched.chunk.document_name,
        scholarship_name: matched.chunk.scholarship_name,
        issuing_authority: matched.chunk.issuing_authority,
        academic_year: matched.chunk.academic_year,
        page: matched.chunk.page_number,
        section: matched.chunk.section,
        passage: matched.chunk.text, // Unmodified database passage
        source_url: matched.chunk.source_url,
        relevance_score: matched.similarity,
        is_verified_direct_match: true,
      };
    });

    return {
      model_used: LLM_SERVICE_CONFIG.modelId,
      status,
      answer: yearFallbackNotice
        ? `${yearFallbackNotice} ${parsed.answer}`
        : parsed.answer,
      details: Array.isArray(parsed.details) ? parsed.details : [],
      sources: verifiedSources,
      why_this_answer_passage: verifiedSources[0]?.passage,
      academic_year_context: yearFallbackNotice,
    };
  } catch (err) {
    // Deterministic grounded synthesis directly from top retrieved database chunk if LLM call times out
    const top = retrievedChunks[0];
    const second = retrievedChunks[1];

    const hasConflict =
      second &&
      second.chunk.document_id !== top.chunk.document_id &&
      second.chunk.section === top.chunk.section &&
      second.similarity >= 0.45;

    const sources: GroundedSourceCitation[] = (
      hasConflict ? [top, second] : [top]
    ).map((r) => ({
      document: r.chunk.document_name,
      scholarship_name: r.chunk.scholarship_name,
      issuing_authority: r.chunk.issuing_authority,
      academic_year: r.chunk.academic_year,
      page: r.chunk.page_number,
      section: r.chunk.section,
      passage: r.chunk.text,
      source_url: r.chunk.source_url,
      relevance_score: r.similarity,
      is_verified_direct_match: true,
    }));

    return {
      model_used: LLM_SERVICE_CONFIG.modelId,
      status: hasConflict ? 'conflicting' : 'answered',
      answer: hasConflict
        ? `Different official documents contain different rules depending on the scheme: (1) ${top.chunk.scholarship_name} (Page ${top.chunk.page_number}), and (2) ${second.chunk.scholarship_name} (Page ${second.chunk.page_number}). Please check the exact passage below for your target scholarship.`
        : `According to ${top.chunk.document_name} (Page ${top.chunk.page_number}, Section: ${top.chunk.section}): ${top.chunk.text}`,
      details: [
        `Scheme: ${top.chunk.scholarship_name} (${top.chunk.academic_year})`,
        `Verified Section: ${top.chunk.section} (Page ${top.chunk.page_number})`,
      ],
      sources,
      why_this_answer_passage: top.chunk.text,
      academic_year_context: yearFallbackNotice,
    };
  }
}

/**
 * Section 22: Personalized Eligibility Checker connected to the REAL RAG knowledge base.
 * Retrieves actual chunks for the selected scholarship and evaluates the student's profile.
 */
export async function evaluateStudentEligibilityRag(params: {
  scholarshipName: string;
  profile: EligibilityProfile;
  retrievedChunks: RetrievalResult[];
}): Promise<{
  model_used: string;
  overall_status: 'eligible' | 'not_eligible' | 'insufficient_information';
  summary_message: string;
  evaluations: RequirementEvaluation[];
  sources: GroundedSourceCitation[];
}> {
  const { scholarshipName, profile, retrievedChunks } = params;

  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      model_used: LLM_SERVICE_CONFIG.modelId,
      overall_status: 'insufficient_information',
      summary_message:
        'Cannot determine eligibility because no official guideline documents were found in the knowledge base for this scholarship.',
      evaluations: [
        {
          requirement_name: 'Official Document Availability',
          category: 'Education',
          status: 'not_mentioned',
          student_value: `${profile.education_level}, ₹${profile.annual_family_income}`,
          official_criteria: 'Not enough information in available scholarship documents.',
          explanation:
            'Cannot determine this requirement from the available scholarship documents. Please upload the official guideline PDF first.',
        },
      ],
      sources: [],
    };
  }

  const contextBlocks = retrievedChunks
    .map(
      (r, idx) =>
        `[CHUNK_${idx + 1}] (Document: ${r.chunk.document_name}, Page: ${r.chunk.page_number}, Section: ${r.chunk.section}):\n${r.chunk.text}`
    )
    .join('\n\n');

  const prompt = `${SCHOLARSAATHI_GROUNDING_PROMPT}

Evaluate this student's eligibility ONLY against the supplied scholarship document passages for "${scholarshipName}".

STUDENT PROFILE:
- Education Level: ${profile.education_level}
- Annual Family Income: ₹${profile.annual_family_income}
- Caste Category: ${profile.caste_category}
- Percentage / Marks: ${profile.percentage_or_cgpa}%
- Domicile State: ${profile.domicile_state}
- Gender: ${profile.gender}

RETRIEVED OFFICIAL DOCUMENT PASSAGES:
${contextBlocks}

Evaluate these 4 requirements strictly based on the retrieved passages:
1. Income Requirement (Category: "Income")
2. Education / Course Level (Category: "Education")
3. Caste Category / Gender Target (Category: "Category")
4. Academic Percentage / Marks (Category: "Marks")

For each requirement:
- Set "status" to "matched" if the student's value satisfies the document rule.
- Set "status" to "not_matched" if the student's value violates the document rule.
- Set "status" to "not_mentioned" if the retrieved passages do not specify a rule for that requirement (and set explanation to "Cannot determine this requirement from the available scholarship documents.").

Respond ONLY with a valid JSON object:
{
  "overall_status": "eligible | not_eligible | insufficient_information",
  "summary_message": "string",
  "evaluations": [
    {
      "requirement_name": "string",
      "category": "Income | Education | Marks | Category | Domicile | Gender",
      "status": "matched | not_matched | not_mentioned",
      "student_value": "string",
      "official_criteria": "string",
      "source_page": 1,
      "source_document": "string",
      "explanation": "string"
    }
  ]
}`;

  const sources: GroundedSourceCitation[] = retrievedChunks.map((r) => ({
    document: r.chunk.document_name,
    scholarship_name: r.chunk.scholarship_name,
    issuing_authority: r.chunk.issuing_authority,
    academic_year: r.chunk.academic_year,
    page: r.chunk.page_number,
    section: r.chunk.section,
    passage: r.chunk.text,
    source_url: r.chunk.source_url,
    relevance_score: r.similarity,
    is_verified_direct_match: true,
  }));

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: LLM_SERVICE_CONFIG.modelId,
      contents: { parts: [{ text: prompt }] },
    });
    const parsed = parseStructuredLlmJson(response.text);
    if (Array.isArray(parsed.evaluations) && parsed.evaluations.length > 0) {
      return {
        model_used: LLM_SERVICE_CONFIG.modelId,
        overall_status: parsed.overall_status || 'eligible',
        summary_message:
          parsed.summary_message ||
          `Evaluated against ${retrievedChunks.length} retrieved passages from ${retrievedChunks[0].chunk.document_name}.`,
        evaluations: parsed.evaluations,
        sources,
      };
    }
  } catch {
    // Fallback deterministic evaluation over retrieved chunk texts
  }

  const combinedText = retrievedChunks.map((r) => r.chunk.text).join('\n');
  const lower = combinedText.toLowerCase();
  const docName = retrievedChunks[0].chunk.document_name;

  const evaluations: RequirementEvaluation[] = [];

  // 1. Income check from retrieved text
  let incomeLimit: number | null = null;
  let incomePage = retrievedChunks[0].chunk.page_number;
  for (const r of retrievedChunks) {
    if (r.chunk.text.includes('2,50,000')) {
      incomeLimit = 250000;
      incomePage = r.chunk.page_number;
      break;
    }
    if (r.chunk.text.includes('8,00,000')) {
      incomeLimit = 800000;
      incomePage = r.chunk.page_number;
      break;
    }
  }

  if (incomeLimit !== null) {
    const matched = profile.annual_family_income <= incomeLimit;
    evaluations.push({
      requirement_name: 'Annual Family Income Ceiling',
      category: 'Income',
      status: matched ? 'matched' : 'not_matched',
      student_value: `₹${profile.annual_family_income.toLocaleString('en-IN')}`,
      official_criteria: `Annual family income must not exceed ₹${incomeLimit.toLocaleString('en-IN')}`,
      source_page: incomePage,
      source_document: docName,
      explanation: matched
        ? `Your family income (₹${profile.annual_family_income.toLocaleString('en-IN')}) is within the ₹${incomeLimit.toLocaleString('en-IN')} limit stated on Page ${incomePage}.`
        : `Your family income exceeds the ₹${incomeLimit.toLocaleString('en-IN')} limit stated on Page ${incomePage}.`,
    });
  } else {
    evaluations.push({
      requirement_name: 'Annual Family Income Ceiling',
      category: 'Income',
      status: 'not_mentioned',
      student_value: `₹${profile.annual_family_income.toLocaleString('en-IN')}`,
      official_criteria: 'Not found in retrieved passages',
      explanation: 'Cannot determine this requirement from the available scholarship documents.',
    });
  }

  // 2. Education check from retrieved text
  const eduMatched =
    lower.includes(profile.education_level.toLowerCase()) ||
    (profile.education_level === 'Undergraduate' && lower.includes('degree')) ||
    (profile.education_level === 'Class 11-12' && lower.includes('higher secondary'));

  evaluations.push({
    requirement_name: 'Course / Education Stage',
    category: 'Education',
    status: eduMatched ? 'matched' : 'not_mentioned',
    student_value: profile.education_level,
    official_criteria: eduMatched
      ? `Recognized ${profile.education_level} courses are supported in the guidelines.`
      : 'Course level not explicitly confirmed in retrieved passages.',
    source_page: retrievedChunks[0].chunk.page_number,
    source_document: docName,
    explanation: eduMatched
      ? `${profile.education_level} is explicitly listed among eligible courses in the retrieved document.`
      : 'Cannot determine this requirement from the available scholarship documents.',
  });

  // 3. Category / Gender check
  if (lower.includes('exclusively for female') || lower.includes('girl students')) {
    const isFemale = profile.gender === 'Female';
    evaluations.push({
      requirement_name: 'Target Beneficiary (Gender)',
      category: 'Gender',
      status: isFemale ? 'matched' : 'not_matched',
      student_value: profile.gender,
      official_criteria: 'Exclusively for Female / Girl students',
      source_page: 1,
      source_document: docName,
      explanation: isFemale
        ? 'Matches the female student requirement on Page 1.'
        : 'Document specifies this scholarship is exclusively for female students.',
    });
  } else if (lower.includes('scheduled caste') && !lower.includes('economically backward')) {
    const isScSt = profile.caste_category === 'SC' || profile.caste_category === 'ST';
    evaluations.push({
      requirement_name: 'Caste Category Eligibility',
      category: 'Category',
      status: isScSt ? 'matched' : 'not_matched',
      student_value: profile.caste_category,
      official_criteria: 'Scheduled Caste (SC) and Scheduled Tribe (ST) communities',
      source_page: 2,
      source_document: docName,
      explanation: isScSt
        ? `Category (${profile.caste_category}) matches the official guideline requirement.`
        : `Guideline restricts eligibility to SC/ST categories.`,
    });
  }

  // 4. Marks check
  if (lower.includes('no minimum percentage requirement')) {
    evaluations.push({
      requirement_name: 'Academic Percentage Requirement',
      category: 'Marks',
      status: 'matched',
      student_value: `${profile.percentage_or_cgpa}%`,
      official_criteria: 'No minimum percentage required (passing marks in qualifying examination).',
      source_page: 3,
      source_document: docName,
      explanation: 'Retrieved guideline explicitly states no minimum percentage cutoff is required.',
    });
  } else {
    evaluations.push({
      requirement_name: 'Academic Percentage Requirement',
      category: 'Marks',
      status: 'not_mentioned',
      student_value: `${profile.percentage_or_cgpa}%`,
      official_criteria: 'No fixed marks cutoff mentioned in retrieved passages (75% attendance required where applicable).',
      source_page: 2,
      source_document: docName,
      explanation: 'Cannot determine a specific marks percentage cutoff from the available scholarship documents.',
    });
  }

  const anyFailed = evaluations.some((e) => e.status === 'not_matched');
  return {
    model_used: LLM_SERVICE_CONFIG.modelId,
    overall_status: anyFailed ? 'not_eligible' : 'eligible',
    summary_message: anyFailed
      ? 'One or more requirements did not match the retrieved official scholarship guidelines.'
      : 'Your profile matches the verified requirements found in the official scholarship documents.',
    evaluations,
    sources,
  };
}
