# ScholarSaathi 🎓

### Scholarships, explained simply.

ScholarSaathi is an AI-powered scholarship assistant that helps students understand scholarship rules, ask questions in natural language, and check eligibility using **verified official scholarship documents**.

It uses a **Retrieval-Augmented Generation (RAG)** approach so that answers are generated from relevant official document passages instead of relying only on the model's general knowledge.

---

## 1. Problem Statement

### AI for Knowledge Too Local for General Models

General-purpose AI models may not reliably know:

* Local scholarship rules
* Government schemes
* College-specific information
* Frequently changing eligibility criteria
* Academic-year-specific requirements
* Official regional documents

ScholarSaathi solves this by creating a focused knowledge base from **verified scholarship PDFs** and retrieving the relevant information before generating an answer.
# Solution - Actual App Preview : https://scholarsaathi-verified-scholarship-ai-assistant.ai.studio/
---

# 2. What ScholarSaathi Does

A student can:

* Ask questions about scholarships
* Search scholarship information using natural language
* Check eligibility
* Understand why they are eligible or not eligible
* See which eligibility criteria passed or failed
* Ask **"What If?"** questions
* Find missing information required for eligibility
* View the exact source passage used for an answer
* See document name, page number, academic year and authority
* Ask questions using voice
* Receive a clear response without unsupported guessing

Administrators can:

* Upload official scholarship PDFs
* Add scholarship metadata
* Maintain the scholarship knowledge base
* Remove outdated documents
* Reset the verified seed knowledge base

---

# 3. Core Idea

ScholarSaathi follows this flow:

```text
Official Scholarship PDF
          ↓
     PDF Extraction
          ↓
    Page-wise Text
          ↓
       Chunking
          ↓
      Embeddings
          ↓
     Vector Store
          ↓
Student Question
          ↓
   Semantic Retrieval
          ↓
 Relevant Official Evidence
          ↓
       Gemma 4
          ↓
 Grounded Answer + Source
```

The model is not expected to remember every scholarship rule.

Instead, the system first retrieves the relevant official information and then provides that evidence to the model.

---

# 4. Why RAG?

RAG means **Retrieval-Augmented Generation**.

Instead of:

```text
Question → AI Model → Answer
```

ScholarSaathi uses:

```text
Question
   ↓
Search Knowledge Base
   ↓
Retrieve Relevant Official Passages
   ↓
Give Evidence to Model
   ↓
Generate Grounded Answer
```

This is useful because scholarship rules can change between academic years.

RAG also allows ScholarSaathi to show the user **where the answer came from**.

---

# 5. Trust-First Design

ScholarSaathi follows these principles:

### Source First

Every answer should be connected to retrieved official evidence whenever possible.

### No Guessing

If the information cannot be found, the system should say:

> I couldn't find this information in the available scholarship documents, so I don't want to guess.

### UNKNOWN ≠ FAIL

If the student's information is missing, the system should mark the criterion as:

```text
UNKNOWN
```

It should not incorrectly mark it as:

```text
FAIL
```

### Academic Year Awareness

Scholarship rules from different academic years should not be mixed.

### User Data Is Not Policy

Student-provided information is treated as input data, not as an authoritative scholarship rule.

---

# 6. Main Features

## 6.1 Source-First Q&A

Students can ask questions such as:

```text
Who can apply for this scholarship?

What is the income limit?

What documents are required?

Is this scholarship available for higher education?

Which students are eligible?
```

The system retrieves relevant passages and generates an answer based on them.

---

## 6.2 Official Document Knowledge Base

Only verified scholarship documents should be added to the knowledge base.

Each document contains metadata such as:

* Scholarship Name
* Document Title
* Issuing Authority
* Academic Year
* Official Source URL
* Category / Scheme Type
* PDF document

---

# 7. Admin PDF Upload

Administrators can upload scholarship documents.

### Required Information

```text
Scholarship Name       *
Document Title         *
Issuing Authority      *
Academic Year         *
Official Source URL   *
Category / Scheme Type
PDF                    *
```

Academic year format:

```text
2026-27
```

The system validates the uploaded document before adding it to the knowledge base.

Invalid or incomplete documents should not enter the knowledge base.

---

# 8. PDF Processing

When a PDF is uploaded:

```text
PDF
 ↓
Validation
 ↓
Text Extraction
 ↓
Page Detection
 ↓
Page-wise Storage
 ↓
Chunk Creation
 ↓
Embedding
 ↓
Vector Index
```

Keeping page information allows ScholarSaathi to show the exact page used for an answer.

---

# 9. Semantic Retrieval

When a student asks a question, the system converts the question into a representation suitable for semantic search.

It then finds the most relevant document chunks.

Example:

```text
Student Question
      ↓
"What is the income limit?"
      ↓
Vector Search
      ↓
Relevant Scholarship Chunk
      ↓
Page 3
```

Only the relevant evidence is passed to the answer-generation stage.

---

# 10. Gemma 4 Integration

ScholarSaathi is designed to use an **open-weight Gemma 4 model** for grounded answer generation.

The intended pipeline is:

```text
Student Question
       ↓
RAG Retrieval
       ↓
Official Evidence
       ↓
Gemma 4
       ↓
Grounded Response
```

The application should only report Gemma 4 as active after an actual Gemma 4 inference call has successfully executed.

The system should not falsely claim that Gemma 4 was used if another model was used as a fallback.

---

# 11. Eligibility Checker

ScholarSaathi can evaluate a student's eligibility using retrieved scholarship rules.

Each criterion is evaluated independently.

Possible states:

```text
PASS
FAIL
UNKNOWN
NOT_APPLICABLE
```

Example:

```text
Age Requirement       PASS
Income Requirement    PASS
Category Requirement  UNKNOWN
Education Requirement PASS
```

Missing information is not automatically treated as failure.

---

# 12. Why Am I Not Eligible?

Students can ask:

```text
Why am I not eligible?
```

The system provides criterion-level reasoning.

Example:

```text
Income Requirement
FAIL

Required:
Income must be below the official limit.

Your value:
Above the stated limit.

Source:
Official Scholarship Document
Page 3
```

The system should not invent a reason for rejection.

---

# 13. What If?

The **What If?** feature allows students to test hypothetical changes.

Example:

```text
Current income: ₹5,00,000

What if my income were ₹3,00,000?
```

The system changes only the selected input and reevaluates the relevant criteria.

It does not modify the official scholarship rules.

---

# 14. Missing Information

ScholarSaathi can identify information that is required but not provided.

Example:

```text
Information Needed:

• Annual Family Income
• Category
• Academic Percentage
• Course Type
```

Only genuinely required missing fields should be shown.

---

# 15. Voice Interaction

ScholarSaathi supports an **Ask by Voice** workflow.

```text
User speaks
    ↓
Audio Transcription
    ↓
Editable Transcript
    ↓
Student Question
    ↓
RAG Retrieval
    ↓
Gemma 4
    ↓
Answer + Source
```

The transcript can be reviewed before submitting the question.

If transcription fails, the user should be asked to retry or type the question instead of silently sending incorrect text.

---

# 16. Not Found Guardrail

If the knowledge base does not contain enough evidence to answer a question, ScholarSaathi should not hallucinate.

Example:

```text
I couldn't find this information in the available
scholarship documents, so I don't want to guess.
```

The system may internally represent this as:

```text
NOT_FOUND
```

or:

```text
INSUFFICIENT_EVIDENCE
```

---

# 17. Example Knowledge Source

One example official document is a Maharashtra Directorate of Technical Education Government Resolution concerning selected students for higher education abroad.

Example metadata:

```text
Scholarship Name:
Scholarship for Meritorious Students from Economically
Weaker Sections of Open Category for Higher Education Abroad

Document Title:
Government Resolution – Selected Students for Higher Education Abroad

Issuing Authority:
Government of Maharashtra – Directorate of Technical Education

Academic Year:
2026-27

Category:
Open Category / General Category –
Higher Education Abroad
```

The document is processed page-by-page so that answers can reference the relevant page.

---

# 18. Evaluation System

ScholarSaathi includes an evaluation workflow for testing RAG performance.

Test cases can evaluate:

* Answer correctness
* Retrieval relevance
* Source document correctness
* Page correctness
* Grounding
* Refusal when information is unavailable
* Eligibility correctness
* Missing-information detection

Example:

```text
Question
   ↓
Expected Answer
   ↓
Expected Source
   ↓
Expected Page
   ↓
RAG Retrieval
   ↓
Generated Answer
   ↓
Evaluation
```

---

# 19. System Architecture

```text
                    SCHOLARSAATHI

                         USER
                          │
             ┌────────────┴────────────┐
             │                         │
          Text Input              Voice Input
             │                         │
             │                    Transcription
             │                         │
             └────────────┬────────────┘
                          ↓
                    User Question
                          ↓
                  RAG Retrieval Layer
                          ↓
                  Vector Knowledge Base
                          ↓
              Relevant Official Passages
                          ↓
                     Gemma 4
                          ↓
                 Grounded Response
                          ↓
              ┌───────────┴───────────┐
              │                       │
            Answer                Source Evidence
              │                       │
              └───────────┬───────────┘
                          ↓
                       Student
```

---

# 20. Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express
* TypeScript
* TSX

### AI / RAG

* Gemma 4
* Embeddings
* Vector retrieval
* RAG pipeline

### Document Processing

* PDF parsing
* Page-wise extraction
* Text chunking

---

# 21. Project Structure

```text
ScholarSaathi/
│
├── src/
│   ├── components/
│   ├── services/
│   │   ├── llmService
│   │   ├── vectorStore
│   │   └── chunking
│   │
│   ├── data/
│   ├── types/
│   └── ...
│
├── server.ts
├── package.json
├── vite.config.*
├── README.md
└── ...
```

The exact structure may evolve as the project develops.

---

# 22. Backend API

Important endpoints include:

```text
GET  /api/documents
POST /api/documents/upload
GET  /api/documents/:id/chunks
DELETE /api/documents/:id
POST /api/documents/reset-seed

POST /api/rag/ask
POST /api/rag/eligibility
POST /api/rag/evaluate-case
```

### `/api/rag/ask`

Used for normal scholarship questions.

### `/api/rag/eligibility`

Used for eligibility evaluation.

### `/api/rag/evaluate-case`

Used for testing and evaluation.

---

# 23. Data Flow for a Student Question

Example:

```text
Student:
"Am I eligible for this scholarship?"
             ↓
System retrieves official rules
             ↓
Relevant evidence is selected
             ↓
Student information is compared
             ↓
Each criterion is evaluated
             ↓
Gemma 4 generates explanation
             ↓
Result + evidence shown
```

---

# 24. Example Student Journey

### Step 1

Student opens ScholarSaathi.

### Step 2

Student asks:

```text
What scholarships are available for higher education?
```

### Step 3

ScholarSaathi searches the verified knowledge base.

### Step 4

Relevant official passages are retrieved.

### Step 5

Gemma 4 generates a grounded explanation.

### Step 6

The student sees:

```text
Answer

Source Document

Page Number

Issuing Authority

Original Passage
```

### Step 7

Student can continue with:

```text
Check my eligibility
```

---

# 25. Security and Reliability Principles

ScholarSaathi should:

* Avoid exposing API keys in frontend code
* Keep secrets in the appropriate environment/secrets system
* Validate uploaded PDFs
* Reject unsupported file types
* Avoid accepting unverified information as official policy
* Keep academic-year information attached to documents
* Prevent unsupported answers
* Clearly distinguish unknown information from failed eligibility
* Avoid claiming a model was used unless it actually executed

---

# 26. Development Status

| Component                      | Status             |
| ------------------------------ | ------------------ |
| React UI                       | Implemented        |
| Backend API                    | Implemented        |
| Scholarship Knowledge Base     | Implemented        |
| Vector Retrieval               | Implemented        |
| RAG Question Answering         | Implemented        |
| Eligibility System             | Implemented        |
| Criterion-level Evaluation     | Implemented        |
| Why Not Eligible               | Implemented        |
| What If                        | Implemented        |
| Missing Information            | Implemented        |
| PDF Upload                     | Being verified     |
| Page-aware PDF Extraction      | Being verified     |
| Gemma 4 Integration            | Being verified     |
| Voice Transcription            | In progress        |
| Vite WebSocket Stability       | Being verified     |
| Production Persistent Database | Future improvement |

---

# 27. Important Model Principle

ScholarSaathi is **not training the model on scholarship PDFs**.

The PDFs form the application's **knowledge base**.

The system uses:

```text
Official Documents
       ↓
Retrieval
       ↓
Relevant Evidence
       ↓
Gemma 4
       ↓
Answer
```

This makes the system easier to update when scholarship rules change.

A new academic-year document can be added without retraining the entire model.

---

# 28. Why ScholarSaathi Is Different

Many AI assistants provide an answer based on general model knowledge.

ScholarSaathi focuses on:

### Local Knowledge

Scholarship information specific to a region, authority or academic year.

### Evidence

The user can see the supporting passage.

### Explainability

Eligibility decisions are broken down criterion-by-criterion.

### No Guessing

The system refuses to invent information when evidence is unavailable.

### Student-Friendly

Complex government scholarship information is explained in simple language.

---

# 29. Future Improvements

Possible future improvements include:

* More government scholarship documents
* More regional scholarship schemes
* Persistent production vector database
* Better multilingual support
* Marathi/Hindi scholarship explanations
* Improved voice interaction
* Document version management
* Automatic document update detection
* Advanced evaluation metrics
* Authentication and admin roles
* Cloud deployment
* Improved Gemma 4 inference infrastructure

---

# 30. One-Line Description

**ScholarSaathi is an AI-powered scholarship assistant that uses RAG and an open-weight Gemma model to answer student questions from verified official documents, explain eligibility, and provide source-level evidence without guessing.**

---

# 31. Final Summary

ScholarSaathi combines:

```text
Verified Scholarship Documents
            +
        RAG Retrieval
            +
         Gemma 4
            +
     Eligibility Analysis
            +
      Source Evidence
            +
       No-Guess Guardrails
            ↓
     TRUSTED SCHOLARSHIP
          ASSISTANT
```

The goal is simple:

> **Make complex scholarship information easy for students to understand — while keeping every important answer grounded in official evidence.**
