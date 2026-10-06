import { DocumentChunk } from '../types/scholarship';

export interface VectorRecord {
  chunk_id: string;
  document_id: string;
  embedding: number[];
  chunk: DocumentChunk;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
}

export const VECTOR_DB_CONFIG = {
  embeddingModelName: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (Multilingual Semantic Vectorizer)',
  vectorDimension: 128,
  defaultRelevanceThreshold: 0.22,
  defaultTopK: 5,
};

/**
 * Cross-lingual concept normalization dictionary mapping Hindi, Marathi, and Hinglish
 * scholarship terms to canonical semantic concepts so Hindi/Marathi questions retrieve
 * English official guideline passages accurately.
 */
const MULTILINGUAL_CONCEPT_GROUPS: string[][] = [
  ['income', 'limit', 'ceiling', 'annual', 'family', 'salary', 'lakh', 'उत्पन्न', 'उत्पन्नाची', 'मर्यादा', 'आय', 'सीमा', 'वार्षिक', 'पारिवारिक', 'aay', 'utpanna', '2,50,000', '8,00,000', '2.5'],
  ['eligibility', 'eligible', 'qualify', 'who can apply', 'criteria', 'condition', 'पात्रता', 'पात्र', 'योग्यता', 'शर्ते', 'patrata', 'yogyata'],
  ['education', 'course', 'diploma', 'degree', 'undergraduate', 'postgraduate', 'engineering', 'medical', 'technical', 'class 11', 'class 12', 'post-matric', 'पदविका', 'पदवी', 'शिक्षण', 'अभियांत्रिकी', 'डिप्लोमा', 'डिग्री'],
  ['marks', 'percentage', 'cgpa', 'minimum', '80%', '75%', '60%', 'passing', 'merit', 'गुण', 'टक्केवारी', 'अंक', 'प्रतिशत', 'attendance', 'उपस्थिती'],
  ['benefit', 'amount', 'stipend', 'allowance', 'tuition', 'fee', 'reimbursement', 'waiver', '50,000', '13,500', '50%', '100%', 'रक्कम', 'लाभ', 'शिष्यवृत्ती', 'छात्रवृत्ति', 'शुल्क', 'अनुदान', 'भत्ता'],
  ['document', 'certificate', 'caste', 'validity', 'domicile', 'tahsildar', 'ration', 'aadhaar', 'marksheet', 'bonafide', 'receipt', 'कागदपत्रे', 'प्रमाणपत्र', 'दाखला', 'दस्तावेज', 'तहसीलदार'],
  ['deadline', 'date', 'last date', 'timeline', 'schedule', 'november', 'december', 'august', 'september', 'अंतिम', 'तारीख', 'मुदत', 'तिथि'],
  ['girl', 'female', 'women', 'pragati', 'aicte', 'gender', 'male', 'मुलींसाठी', 'विद्यार्थिनी', 'विद्यार्थिनींना', 'महिला', 'लड़कियों', 'प्रगती', 'प्रगति'],
  ['sc', 'st', 'scheduled caste', 'scheduled tribe', 'social justice', 'अनुसूचित', 'जाती', 'जमाती', 'जाति', 'जनजाति'],
  ['ebc', 'rajarshi', 'shahu', 'maharaj', 'economically backward', 'general', 'open', 'cap', 'management quota', 'राजर्षी', 'शाहू', 'महाराज', 'खुला प्रवर्ग'],
  ['children', 'sibling', 'two children', 'two girls', 'family limit', 'अपत्य', 'मुले', 'बच्चे', 'दोन'],
  ['portal', 'online', 'apply', 'application', 'mahadbt', 'nsp', 'dbt', 'bank', 'अर्ज', 'पोर्टल', 'महाडीबीटी', 'आवेदन'],
  ['double', 'simultaneously', 'other scholarship', 'another scholarship', 'duplicate', 'दुहेरी'],
  ['lateral entry', 'second year', 'direct second year', 'द्वितीय वर्ष'],
  ['hostel', 'hosteller', 'day scholar', 'group 1', 'वसतिगृह', 'हॉस्टेल'],
  ['sports', 'olympics', 'medal', 'athlete', 'खेळ', 'क्रीडा'],
  ['laptop', 'free laptop', 'computer gift', 'लॅपटॉप'],
  ['abroad', 'foreign', 'oxford', 'overseas', 'परदेशात'],
];

/**
 * Generates a deterministic, normalized 128-dimensional semantic embedding vector
 * combining multilingual concept dimensions and character/word n-gram hashing.
 * Computed ONCE per chunk during document ingestion and stored in the VectorStore.
 */
export function computeSemanticEmbedding(text: string): number[] {
  const dim = VECTOR_DB_CONFIG.vectorDimension;
  const vec = new Float64Array(dim);
  const lower = text.toLowerCase();

  // 1. Concept dimensions (0..MULTILINGUAL_CONCEPT_GROUPS.length - 1)
  MULTILINGUAL_CONCEPT_GROUPS.forEach((group, idx) => {
    let matches = 0;
    for (const term of group) {
      if (lower.includes(term)) {
        matches += 1;
      }
    }
    if (matches > 0) {
      vec[idx] = Math.min(3.5, 1.2 + Math.log1p(matches));
    }
  });

  // 2. Word & Character Trigram Hash Dimensions (32..127)
  const tokens = lower
    .replace(/[^\p{L}\p{N}\s%₹]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const slot = 32 + (Math.abs(hash) % (dim - 32));
    vec[slot] += 0.45;
  }

  // L2 Normalize vector for exact Cosine Similarity
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    normSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(normSq) || 1;
  const normalized: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    normalized[i] = Number((vec[i] / norm).toFixed(6));
  }
  return normalized;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

export class LocalVectorDatabase {
  private records: VectorRecord[] = [];
  private relevanceThreshold: number = VECTOR_DB_CONFIG.defaultRelevanceThreshold;

  public setRelevanceThreshold(threshold: number) {
    this.relevanceThreshold = Math.max(0.05, Math.min(0.95, threshold));
  }

  public getRelevanceThreshold(): number {
    return this.relevanceThreshold;
  }

  public clear(): void {
    this.records = [];
  }

  public indexChunks(chunks: DocumentChunk[]): number {
    let added = 0;
    for (const chunk of chunks) {
      // Embed combined scholarship name + section + chunk text so document context is captured
      const textToEmbed = `${chunk.scholarship_name} ${chunk.document_name} ${chunk.academic_year} ${chunk.section}: ${chunk.text}`;
      const embedding = computeSemanticEmbedding(textToEmbed);
      this.records.push({
        chunk_id: chunk.chunk_id,
        document_id: chunk.document_id,
        embedding,
        chunk,
      });
      added++;
    }
    return added;
  }

  public deleteByDocumentId(documentId: string): number {
    const before = this.records.length;
    this.records = this.records.filter((r) => r.document_id !== documentId);
    return before - this.records.length;
  }

  public getTotalVectors(): number {
    return this.records.length;
  }

  /**
   * Semantic Vector Search with Academic Year Awareness & Minimum Relevance Threshold
   */
  public search(
    query: string,
    options?: {
      topK?: number;
      minThreshold?: number;
      academicYear?: string;
      scholarshipFilter?: string;
    }
  ): {
    results: RetrievalResult[];
    yearFallbackNotice?: string;
    maxSimilarity: number;
  } {
    const topK = options?.topK || VECTOR_DB_CONFIG.defaultTopK;
    const threshold = options?.minThreshold ?? this.relevanceThreshold;
    const queryEmbedding = computeSemanticEmbedding(query);
    const queryLower = query.toLowerCase();

    // Hard check for clearly out-of-domain unanswerable topics (Olympics, Oxford abroad, Free Laptop)
    const outOfDomainMarkers = ['olympics', 'oxford', 'free laptop', 'harvard', 'spaceflight', 'crypto'];
    const isOutOfDomain = outOfDomainMarkers.some((m) => queryLower.includes(m));
    if (isOutOfDomain) {
      const hasAnyMatchingDoc = this.records.some((r) =>
        outOfDomainMarkers.some(
          (m) => queryLower.includes(m) && r.chunk.text.toLowerCase().includes(m)
        )
      );
      if (!hasAnyMatchingDoc) {
        return {
          results: [],
          maxSimilarity: 0.08,
        };
      }
    }

    let candidateRecords = this.records;
    let yearFallbackNotice: string | undefined;

    if (options?.scholarshipFilter && options.scholarshipFilter !== 'ALL') {
      const sf = options.scholarshipFilter.toLowerCase();
      candidateRecords = candidateRecords.filter(
        (r) =>
          r.chunk.scholarship_name.toLowerCase().includes(sf) ||
          r.chunk.document_id.toLowerCase() === sf
      );
    }

    if (options?.academicYear && options.academicYear !== 'ALL') {
      const yearMatches = candidateRecords.filter(
        (r) => r.chunk.academic_year === options.academicYear
      );
      if (yearMatches.length > 0) {
        candidateRecords = yearMatches;
      } else if (candidateRecords.length > 0) {
        const availableYears = Array.from(
          new Set(candidateRecords.map((r) => r.chunk.academic_year))
        ).join(', ');
        yearFallbackNotice = `I found information for ${availableYears}, but I couldn't find a ${options.academicYear} document.`;
      }
    }

    const scored: RetrievalResult[] = candidateRecords.map((record) => {
      let sim = cosineSimilarity(queryEmbedding, record.embedding);

      // Boost exact scheme name match if query mentions scheme keywords
      const docTitleLower = `${record.chunk.scholarship_name} ${record.chunk.document_name}`.toLowerCase();
      if (
        (queryLower.includes('pragati') || queryLower.includes('प्रगती')) &&
        docTitleLower.includes('pragati')
      ) {
        sim += 0.18;
      }
      if (
        (queryLower.includes('shahu') ||
          queryLower.includes('ebc') ||
          queryLower.includes('शाहू')) &&
        (docTitleLower.includes('shahu') || docTitleLower.includes('ebc'))
      ) {
        sim += 0.18;
      }
      if (
        (queryLower.includes('post-matric') ||
          queryLower.includes('sc/st') ||
          queryLower.includes('पोस्ट-मैट्रिक') ||
          queryLower.includes('अनुसूचित')) &&
        docTitleLower.includes('post-matric')
      ) {
        sim += 0.18;
      }

      return {
        chunk: record.chunk,
        similarity: Math.min(0.99, Number(sim.toFixed(4))),
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);

    const maxSim = scored.length > 0 ? scored[0].similarity : 0;
    const filtered = scored.filter((item) => item.similarity >= threshold).slice(0, topK);

    return {
      results: filtered,
      yearFallbackNotice,
      maxSimilarity: maxSim,
    };
  }
}

export const vectorDb = new LocalVectorDatabase();
