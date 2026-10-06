import { DocumentChunk, DocumentPageData } from '../types/scholarship';

const SECTION_PATTERNS: {
  section: DocumentChunk['section'];
  keywords: string[];
}[] = [
  {
    section: 'Income Requirement',
    keywords: [
      'annual family income',
      'income limit',
      'income criteria',
      'income ceiling',
      'parental income',
      'income certificate',
      'uttpannachi maryada',
      'aavak maryada',
      'parivarik aay',
      'family income should not exceed',
      'gross annual income',
    ],
  },
  {
    section: 'Academic Requirement',
    keywords: [
      'minimum marks',
      'educational qualification',
      'percentage criteria',
      'qualifying exam',
      'attendance requirement',
      'cgpa requirement',
      'merit list',
      'recognized university',
      'recognized institution',
      'eligible courses',
      'aicte approved',
    ],
  },
  {
    section: 'Required Documents',
    keywords: [
      'required documents',
      'list of documents',
      'documents to be attached',
      'enclosures',
      'domicile certificate',
      'caste certificate',
      'income certificate',
      'ration card',
      'aadhaar card',
      'bonafide certificate',
      'fee receipt',
      'kagpatre',
      'dastavej',
    ],
  },
  {
    section: 'Benefits & Allowance',
    keywords: [
      'benefits',
      'scholarship amount',
      'maintenance allowance',
      'tuition fee',
      'exam fee reimbursement',
      'financial assistance',
      'hostel allowance',
      'stipend',
      'rate of scholarship',
      'sanctioned amount',
    ],
  },
  {
    section: 'Application Process',
    keywords: [
      'how to apply',
      'application procedure',
      'mode of application',
      'online portal',
      'registration process',
      'scrutiny of application',
      'disbursement of scholarship',
      'mahadbt portal',
      'national scholarship portal',
      'dbt direct benefit transfer',
    ],
  },
  {
    section: 'Important Dates',
    keywords: [
      'important dates',
      'last date for submission',
      'application deadline',
      'extended date',
      'timeline',
      'academic year schedule',
      'opening date',
      'closing date',
    ],
  },
  {
    section: 'Renewal Criteria',
    keywords: [
      'renewal of scholarship',
      'renewal policy',
      'continuation criteria',
      'passing in first attempt',
      'second year renewal',
      'subsequent years',
    ],
  },
  {
    section: 'Restrictions & Quota',
    keywords: [
      'restrictions',
      'not eligible',
      'disqualification',
      'maximum two children',
      'holding any other scholarship',
      'twin criteria',
      'quota',
      'reservation',
    ],
  },
  {
    section: 'Eligibility',
    keywords: [
      'eligibility criteria',
      'eligibility',
      'who can apply',
      'eligible candidates',
      'target group',
      'beneficiary',
      'patrata',
      'yogyata',
      'conditions for award',
    ],
  },
];

export function detectSection(text: string): DocumentChunk['section'] {
  const lower = text.toLowerCase();
  for (const item of SECTION_PATTERNS) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return item.section;
      }
    }
  }
  return 'General Information';
}

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface ChunkingOptions {
  targetChunkSize?: number;
  chunkOverlap?: number;
}

export function chunkPageData(
  pages: DocumentPageData[],
  metadata: {
    document_id: string;
    scholarship_name: string;
    document_name: string;
    issuing_authority: string;
    academic_year: string;
    source_url: string;
  },
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const targetSize = options.targetChunkSize || 450;
  const overlap = options.chunkOverlap || 80;
  const chunks: DocumentChunk[] = [];

  for (const page of pages) {
    const cleaned = cleanText(page.text);
    if (!cleaned) continue;

    // Split page text by paragraphs or double newlines
    const paragraphs = cleaned
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    let currentBuffer = '';
    let paragraphIndex = 0;

    for (const para of paragraphs) {
      paragraphIndex++;
      // If a single paragraph is very long, break it into sentence-aware blocks
      if (para.length > targetSize + 200) {
        const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
        for (const sent of sentences) {
          if (currentBuffer.length + sent.length > targetSize && currentBuffer.length >= targetSize / 2) {
            const chunkText = currentBuffer.trim();
            const section = detectSection(chunkText);
            chunks.push({
              chunk_id: `${metadata.document_id}-p${page.page_number}-c${chunks.length + 1}`,
              document_id: metadata.document_id,
              scholarship_name: metadata.scholarship_name,
              document_name: metadata.document_name,
              issuing_authority: metadata.issuing_authority,
              academic_year: metadata.academic_year,
              page_number: page.page_number,
              section,
              text: chunkText,
              source_url: metadata.source_url,
              character_count: chunkText.length,
            });
            // Keep overlap from the end of currentBuffer
            currentBuffer = currentBuffer.slice(-overlap) + ' ' + sent;
          } else {
            currentBuffer = currentBuffer ? currentBuffer + ' ' + sent : sent;
          }
        }
      } else {
        if (currentBuffer.length + para.length > targetSize && currentBuffer.length >= targetSize / 2) {
          const chunkText = currentBuffer.trim();
          const section = detectSection(chunkText);
          chunks.push({
            chunk_id: `${metadata.document_id}-p${page.page_number}-c${chunks.length + 1}`,
            document_id: metadata.document_id,
            scholarship_name: metadata.scholarship_name,
            document_name: metadata.document_name,
            issuing_authority: metadata.issuing_authority,
            academic_year: metadata.academic_year,
            page_number: page.page_number,
            section,
            text: chunkText,
            source_url: metadata.source_url,
            character_count: chunkText.length,
          });
          currentBuffer = currentBuffer.slice(-overlap) + '\n\n' + para;
        } else {
          currentBuffer = currentBuffer ? currentBuffer + '\n\n' + para : para;
        }
      }
    }

    // Flush any remaining buffer on this page
    if (currentBuffer.trim().length > 0) {
      const chunkText = currentBuffer.trim();
      const section = detectSection(chunkText);
      chunks.push({
        chunk_id: `${metadata.document_id}-p${page.page_number}-c${chunks.length + 1}`,
        document_id: metadata.document_id,
        scholarship_name: metadata.scholarship_name,
        document_name: metadata.document_name,
        issuing_authority: metadata.issuing_authority,
        academic_year: metadata.academic_year,
        page_number: page.page_number,
        section,
        text: chunkText,
        source_url: metadata.source_url,
        character_count: chunkText.length,
      });
      currentBuffer = '';
    }
  }

  return chunks;
}
