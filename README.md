# ExamCraft AI — Academic Assessment Suite

> **Tagline:** *From syllabus to structured assessments — intelligently.*

ExamCraft AI is a complete, production-ready full-stack academic assessment engineering platform built for higher-education institutions and university faculty. It automates syllabus-grounded question paper creation, model answer formulation, criterion-based marking rubric balancing, source evidence verification, and multi-format PDF publishing.

---

## 🌟 Key Differentiators & Highlights

1. **Dual AI & Grounded RAG Generation:** Real LLM integration via official Google Gemini SDK (`gemini-3.8-flash`) and OpenAI (`gpt-4o-mini`) with automatic fallback to syllabus-grounded heuristic synthesis when no API key is configured.
2. **PostgreSQL Relational Architecture:** Normalized database schema (`schema.sql`) covering users, sessions, documents, chunks, blueprints, papers, questions, answers, rubrics, and audit trails. Includes automatic fallback to embedded SQLite (`examcraft.db`) for immediate zero-config local evaluation.
3. **Multi-Format Document Ingestion:** Server-side extraction with page-level metadata for **PDF** (`pdf-parse`), **DOCX** (`mammoth`), and **TXT**, coupled with client-side **Tesseract.js OCR** for scanned raster documents.
4. **Trustworthy Source Traceability:** Strict excerpt verification ensures citations and page references match the source material. Categorized with verifiable statuses: *Supported by source*, *Application based on source*, *Evidence requires review*, and *No source evidence found*.
5. **Dynamic Blueprint Validation:** Real-time mathematical verification ensuring question group marks equal the target total marks and cognitive difficulty splits sum to 100%.
6. **Live Rubric Balancing Engine:** Every question includes criterion descriptions, marks per criterion, partial-credit rules, and strict validation that rubric criteria equal total question marks.
7. **Separate Academic PDF Exports (PDFKit & jsPDF):**
   - **Student Question Paper PDF:** Print-ready institutional layout with candidate instructions and question groups. *Strictly zero model answers or rubrics.*
   - **Faculty Answer Key & Rubric PDF:** Confidential evaluation dossier with comprehensive model answers, key concepts, expected points, and criterion breakdown tables.
   - **Curriculum Traceability Audit PDF:** Landscape compliance dossier mapping each question to Bloom's taxonomy, syllabus modules, exact page numbers, and cited passages.
8. **Role-Based Authentication:** BCrypt password hashing, JWT token authentication, and role separation (Teacher / Administrator).

---

## 🏗️ Architecture & Technology Stack

```
ExamCraft_AI/
├── server.js                      # Express server entry point & static file server
├── api.js                         # Frontend REST API client
├── index.html                     # Responsive single-page application & modals
├── style.css                      # Pastel auroral frosted glassmorphism design system
├── script.js                      # Frontend application logic, wizard & state manager
├── logo.png                       # Official application icon & branding
├── package.json                   # Dependencies & run scripts
├── .env.example                   # Environment configuration template
├── .env                           # Local runtime environment
├── server/
│   ├── db/
│   │   ├── database.js            # Unified database client (PostgreSQL & SQLite)
│   │   └── schema.sql             # Relational DDL schema & constraints
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role authorization
│   ├── routes/
│   │   ├── auth.js                # Register, login, me, logout
│   │   ├── dashboard.js           # Real database metric aggregations
│   │   ├── documents.js           # Multer upload, text extraction & chunking
│   │   ├── blueprints.js          # Blueprint configuration & validation
│   │   ├── papers.js              # AI generation, review, approve, duplicate
│   │   ├── questions.js           # Reusable question bank management
│   │   ├── exports.js             # PDFKit streaming downloads
│   │   ├── analytics.js           # Academic analytics & distribution charts
│   │   └── settings.js            # Faculty preferences & institutional details
│   ├── services/
│   │   ├── aiGenerator.js         # Gemini / OpenAI / Grounded RAG engine
│   │   ├── documentProcessor.js   # PDF, DOCX, TXT parser & chunker
│   │   ├── retrieval.js           # Keyword search & verified excerpt matching
│   │   └── pdfService.js          # PDFKit document generator
│   └── storage/
│       └── uploads/               # Dedicated server file repository
└── tests/
    └── run-tests.js               # Automated unit, integration, and security tests
```

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node.js v22.20.0)
- **PostgreSQL**: (Optional) PostgreSQL 14+ or local service. If PostgreSQL credentials are not provided in `.env`, the system automatically initializes persistent SQL storage in `examcraft.db`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

To configure real Google Gemini API:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

To configure PostgreSQL:
```env
DATABASE_URL=postgres://postgres:your_password@localhost:5432/examcraft_ai
```

### 4. Start the Application
```bash
npm start
```
The application will launch at:
👉 **http://localhost:8080**

---

## 🔑 Default Credentials for Evaluation

The system comes pre-seeded with faculty and administrator credentials:

| Role | Email | Password |
|---|---|---|
| **Faculty / Teacher** | `teacher@examcraft.ai` | `Faculty@2026` |
| **Administrator** | `admin@examcraft.ai` | `Admin@2026` |

*Note: For instant evaluation, you can also click the **"Quick Sign In"** button inside the Faculty Authentication modal.*

---

## 🧪 Running Automated Tests

To execute the complete 15-test automated validation suite (Database, Authentication, Document Chunking, Excerpt Verification, Blueprint Validation, Rubric Balancing, Paper Approval, and PDF Exports):

```bash
npm test
```

Expected output:
```
===================================================================
🏁 TEST RESULTS: 15 OF 15 TESTS PASSED (100% SUCCESS)
===================================================================
```

---

## 🎬 End-to-End Workflow Guide

1. **Sign In**: Access your faculty dashboard with real metrics reflecting your database records.
2. **Step 1 (Upload Materials)**: Upload a course syllabus PDF, DOCX, or TXT file. Client-side and server-side parsers extract text, preserve page numbers, and chunk topics.
3. **Step 2 (Configure Blueprint)**: Specify exam title, duration, total marks, cognitive difficulty split, and question groups (e.g. Part A 5 x 2 Marks, Part B 5 x 8 Marks). Live validation ensures marks balance.
4. **Step 3 (Generate Assessment)**: Click **"Generate Assessment Draft"**. The system queries the AI model (or grounded RAG engine), synthesizing questions, model answers, and rubric splits.
5. **Step 4 (Review Workspace)**:
   - Edit questions, model answers, or key concepts directly.
   - Adjust criterion marks with live rubric balancing.
   - Trace source citations back to exact syllabus pages.
6. **Approve Assessment**: Click **"Final Paper Approval"** to digitally certify the examination.
7. **Export Separate PDFs**:
   - Download **Student Question Paper PDF** (strict no-answers format).
   - Download **Faculty Answer Key & Rubric PDF** (confidential marking guide).
   - Download **Traceability Matrix PDF** (compliance audit dossier).
