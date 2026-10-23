-- ===================================================================
-- ExamCraft AI — Normalized Relational Database Schema
-- Compatible with PostgreSQL & SQLite (ANSI SQL standard)
-- ===================================================================

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  institution TEXT,
  role TEXT NOT NULL DEFAULT 'teacher', -- 'teacher' | 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions & Refresh Tokens
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects Catalog
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  academic_year TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Source Documents (Syllabus, Reference PDFs, TXT, DOCX)
CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  page_count INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'extracted' | 'ocr_required' | 'failed'
  error_message TEXT,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Document Chunks (for RAG Retrieval & Exact Page Citations)
CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  page_number INTEGER DEFAULT 1,
  section_title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Document Processing Jobs
CREATE TABLE IF NOT EXISTS document_processing_jobs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Assessment Blueprints
CREATE TABLE IF NOT EXISTS assessment_blueprints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  course_code TEXT NOT NULL,
  academic_year TEXT DEFAULT '2025 - 2026',
  exam_type TEXT NOT NULL,
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  instructions TEXT,
  difficulty_easy INTEGER DEFAULT 30,
  difficulty_medium INTEGER DEFAULT 50,
  difficulty_hard INTEGER DEFAULT 20,
  units_covered TEXT, -- JSON Array string
  question_groups TEXT, -- JSON Array string of groups
  status TEXT DEFAULT 'configured',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Question Papers
CREATE TABLE IF NOT EXISTS question_papers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blueprint_id TEXT REFERENCES assessment_blueprints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  course_code TEXT NOT NULL,
  academic_year TEXT DEFAULT '2025 - 2026',
  exam_type TEXT NOT NULL,
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  instructions TEXT,
  institution_name TEXT,
  department_name TEXT,
  exam_date TEXT,
  status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft' | 'In Review' | 'Approved'
  approved_by TEXT,
  approved_at TIMESTAMP,
  review_notes TEXT,
  source_doc_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Questions (Individual Examination Items)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  paper_id TEXT REFERENCES question_papers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'Theory' | 'Short Answer' | 'Long Answer' | 'Scenario-Based' | 'Numerical/Problem-Solving' | 'MCQ'
  subject TEXT NOT NULL,
  unit TEXT NOT NULL,
  difficulty TEXT NOT NULL, -- 'Easy' | 'Medium' | 'Hard'
  marks INTEGER NOT NULL,
  bloom_level TEXT, -- 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
  options TEXT, -- JSON string for MCQs [ { "label": "A", "text": "..." } ]
  correct_option TEXT,
  explanation TEXT,
  solution_steps TEXT,
  source_doc_id TEXT REFERENCES source_documents(id) ON DELETE SET NULL,
  source_doc_name TEXT,
  source_page TEXT,
  source_section TEXT,
  source_excerpt TEXT,
  evidence_status TEXT DEFAULT 'Supported by source', -- 'Supported by source' | 'Application based on source' | 'Evidence requires review' | 'No source evidence found'
  review_status TEXT DEFAULT 'Unreviewed', -- 'Unreviewed' | 'Approved' | 'Requires Modification' | 'Rejected'
  teacher_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Answer Scripts & Model Responses
CREATE TABLE IF NOT EXISTS answer_scripts (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  model_answer TEXT NOT NULL,
  key_concepts TEXT,
  expected_points TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Marking Criteria (Rubric Breakdown)
CREATE TABLE IF NOT EXISTS marking_criteria (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  criterion_description TEXT NOT NULL,
  marks_allocated NUMERIC(4, 1) NOT NULL,
  partial_credit_rules TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Question Evidence Linkages
CREATE TABLE IF NOT EXISTS question_evidence (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  chunk_id TEXT REFERENCES document_chunks(id) ON DELETE SET NULL,
  document_id TEXT REFERENCES source_documents(id) ON DELETE SET NULL,
  page_number INTEGER,
  excerpt TEXT NOT NULL,
  relevance_score NUMERIC(4, 2) DEFAULT 1.0,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Question Reviews
CREATE TABLE IF NOT EXISTS question_reviews (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Paper Reviews (Audit Trail & Signature Protocol)
CREATE TABLE IF NOT EXISTS paper_reviews (
  id TEXT PRIMARY KEY,
  paper_id TEXT NOT NULL REFERENCES question_papers(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Activity Logs (Real-time Auditing)
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Application Settings
CREATE TABLE IF NOT EXISTS application_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings_json TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Query Performance & Isolation
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_docs_user ON source_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_papers_user ON question_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_status ON question_papers(status);
CREATE INDEX IF NOT EXISTS idx_questions_paper ON questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
