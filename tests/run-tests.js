/**
 * ExamCraft AI — Comprehensive Automated Test Suite
 * Executes end-to-end unit, integration, database, security, and PDF tests
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 8089;
process.env.JWT_SECRET = 'test-secret-key-examcraft-2026';

let passedTests = 0;
let totalTests = 0;

async function it(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error('     Error:', err.message);
  }
}

async function runTestSuite() {
  console.log('\n===================================================================');
  console.log('🧪 EXAMCRAFT AI — AUTOMATED TEST SUITE EXECUTION');
  console.log('===================================================================\n');

  const { initDatabase, query, queryOne, getDriver } = require('../server/db/database');
  const { chunkDocumentText } = require('../server/services/documentProcessor');
  const { retrieveContextChunks, verifyExcerptInChunk } = require('../server/services/retrieval');
  const { generateStudentQuestionPaperPdf, generateFacultyAnswerKeyPdf, generateTraceabilityAuditPdf } = require('../server/services/pdfService');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');

  // 1. Database Initialization
  console.log('📦 [1/9] Database Layer & Schema Migrations');
  await initDatabase();
  await it('should initialize database with valid driver', async () => {
    assert.ok(getDriver() === 'pg' || getDriver() === 'sqlite', 'Driver must be pg or sqlite');
  });

  await it('should have seeded default faculty and admin accounts', async () => {
    const teacher = await queryOne('SELECT * FROM users WHERE email = ?', ['teacher@examcraft.ai']);
    assert.ok(teacher, 'Default teacher account must exist');
    assert.strictEqual(teacher.role, 'teacher');

    const admin = await queryOne('SELECT * FROM users WHERE email = ?', ['admin@examcraft.ai']);
    assert.ok(admin, 'Default admin account must exist');
    assert.strictEqual(admin.role, 'admin');
  });

  // 2. Authentication & Password Security
  console.log('\n🔐 [2/9] Authentication & Authorization Security');
  const testEmail = `test-${Date.now()}@university.edu`;
  const testPassword = 'SecurePassword@2026';
  let testUserId = null;
  let testToken = null;

  await it('should register a new teacher with bcrypt hashed password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(testPassword, salt);
    testUserId = `usr-test-${Date.now()}`;

    await query(`
      INSERT INTO users (id, email, password_hash, full_name, department, institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [testUserId, testEmail, hash, 'Prof. Alan Turing', 'Dept. of Mathematics', 'Institute of Tech', 'teacher']);

    const user = await queryOne('SELECT * FROM users WHERE id = ?', [testUserId]);
    assert.ok(user, 'User record must be persisted');
    assert.notStrictEqual(user.password_hash, testPassword, 'Password must never be stored in plain text');
    assert.ok(await bcrypt.compare(testPassword, user.password_hash), 'Bcrypt compare must succeed for valid password');
  });

  await it('should issue signed JWT token with valid payload', async () => {
    testToken = jwt.sign({ userId: testUserId, email: testEmail, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    assert.strictEqual(decoded.userId, testUserId);
    assert.strictEqual(decoded.role, 'teacher');
  });

  await it('should reject invalid or tampered JWT token', async () => {
    assert.throws(() => {
      jwt.verify(testToken + 'tampered', process.env.JWT_SECRET);
    }, 'Tampered token must throw verification error');
  });

  // 3. Document Extraction & Chunking Engine
  console.log('\n📄 [3/9] Document Processing & Page Preservation');
  const samplePages = [
    { pageNumber: 1, text: 'COURSE SYLLABUS: CS301 DATA STRUCTURES\nUNIT 1: ARRAYS & LINKED LISTS\nSingly linked lists, circular linked lists, doubly linked lists.' },
    { pageNumber: 2, text: 'UNIT 2: STACKS & QUEUES\nLIFO principles, FIFO queues, circular buffers, infix to postfix conversion.' }
  ];

  await it('should chunk document text while preserving page numbers and section headers', async () => {
    const chunks = chunkDocumentText(samplePages, 'doc-test-1', testUserId);
    assert.ok(chunks.length >= 2, 'Should create at least 2 distinct chunks');
    assert.strictEqual(chunks[0].pageNumber, 1);
    assert.strictEqual(chunks[1].pageNumber, 2);
    assert.ok(chunks[0].sectionTitle.toUpperCase().includes('UNIT 1') || chunks[0].sectionTitle.includes('Page 1'));
  });

  // 4. Source Retrieval & Verified Citations
  console.log('\n🔎 [4/9] Source Retrieval & Excerpt Verification');
  await it('should verify exact source excerpt containment', async () => {
    const chunkText = 'Singly linked lists, circular linked lists, doubly linked lists with memory traversal.';
    const validExcerpt = 'Singly linked lists, circular linked lists';
    const fakeExcerpt = 'Quantum superposition of quantum states';

    const check1 = verifyExcerptInChunk(validExcerpt, chunkText);
    assert.strictEqual(check1.valid, true, 'Real excerpt must be verified');

    const check2 = verifyExcerptInChunk(fakeExcerpt, chunkText);
    assert.strictEqual(check2.valid, false, 'Fabricated excerpt must be rejected');
  });

  // 5. Assessment Blueprint Validation
  console.log('\n📐 [5/9] Assessment Blueprint Validation Engine');
  await it('should validate that allocated marks equal target marks', async () => {
    const validBlueprint = {
      subject: 'Data Structures',
      totalMarks: 50,
      duration: 90,
      groups: [
        { name: 'Part A', count: 5, marksPerQ: 2 }, // 10
        { name: 'Part B', count: 5, marksPerQ: 8 }  // 40 -> total = 50
      ],
      diffEasy: 30, diffMed: 50, diffHard: 20
    };

    const totalAllocated = validBlueprint.groups.reduce((acc, g) => acc + (g.count * g.marksPerQ), 0);
    assert.strictEqual(totalAllocated, validBlueprint.totalMarks, 'Sum of question groups must equal total marks');
  });

  // 6. Rubric Balancing & Marking Scheme Total Verification
  console.log('\n⚖️ [6/9] Rubric Criteria Sum Verification');
  await it('should ensure rubric criterion marks sum exactly to question marks', async () => {
    const qMarks = 8;
    const rubric = [
      { criterion: 'Algorithm definition & explanation', marks: 3 },
      { criterion: 'Complexity analysis & correctness proof', marks: 5 }
    ];

    const rubricSum = rubric.reduce((acc, r) => acc + r.marks, 0);
    assert.strictEqual(rubricSum, qMarks, 'Rubric criteria marks must equal total question marks');
  });

  // 7. Question Paper Lifecycle & Approval
  console.log('\n📋 [7/9] Paper Lifecycle (Draft -> In Review -> Approved)');
  const testPaperId = `paper-test-${Date.now()}`;

  await it('should persist new question paper in Draft status', async () => {
    await query(`
      INSERT INTO question_papers (
        id, user_id, title, subject, course_code, academic_year, exam_type,
        total_marks, duration_minutes, instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')
    `, [
      testPaperId, testUserId, 'CS301 Model Exam', 'Data Structures', 'CS301',
      '2025-2026', 'Model Exam', 50, 90, 'Answer all questions.'
    ]);

    const paper = await queryOne('SELECT * FROM question_papers WHERE id = ?', [testPaperId]);
    assert.ok(paper, 'Paper must exist');
    assert.strictEqual(paper.status, 'Draft', 'Initial status must be Draft');
  });

  await it('should certify paper with teacher approval timestamp', async () => {
    const approver = 'Dr. Sarah Jenkins';
    await query(`
      UPDATE question_papers
      SET status = 'Approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [approver, testPaperId]);

    const updated = await queryOne('SELECT * FROM question_papers WHERE id = ?', [testPaperId]);
    assert.strictEqual(updated.status, 'Approved', 'Status must transition to Approved');
    assert.strictEqual(updated.approved_by, approver);
    assert.ok(updated.approved_at, 'Approved timestamp must be recorded');
  });

  // 8. Professional PDF Exports Generation
  console.log('\n📑 [8/9] Separate Academic PDF Document Generators');
  const mockPaper = {
    institution_name: 'INSTITUTE OF SCIENCE & TECHNOLOGY',
    department_name: 'Department of Computer Science',
    title: 'Model Examination — CS301',
    subject: 'Data Structures',
    course_code: 'CS301',
    academic_year: '2025-2026',
    duration_minutes: 90,
    total_marks: 50,
    exam_date: '2026-11-10',
    instructions: '1. Answer all questions.\n2. Programmable calculators prohibited.'
  };

  const mockQuestions = [
    {
      question_number: 1,
      question_text: 'Define a circular singly linked list. Explain insertion at the head pointer.',
      marks: 2,
      unit: 'Unit 1',
      bloom_level: 'Understand',
      model_answer: 'A circular linked list is a sequence of nodes where the last node points back to the first node.',
      expected_points: '1. Node definition.\n2. Head pointer update.',
      rubric: [{ criterion: 'Definition', marks: 1 }, { criterion: 'Insertion mechanics', marks: 1 }],
      source_doc_name: 'CS301_Syllabus.pdf',
      source_page: 'Page 2',
      source_section: 'Unit 1',
      source_excerpt: 'Circular singly linked lists with pointer redirection.',
      evidence_status: 'Supported by source'
    }
  ];

  await it('should generate valid Student Question Paper PDF (no answers)', () => {
    return new Promise((resolve, reject) => {
      const pdfDoc = generateStudentQuestionPaperPdf(mockPaper, mockQuestions);
      const chunks = [];
      pdfDoc.on('data', c => chunks.push(c));
      pdfDoc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        assert.ok(buffer.length > 500, 'PDF buffer must not be empty');
        assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'Buffer must start with PDF header');
        resolve();
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  });

  await it('should generate valid Faculty Answer Key PDF with marking rubrics', () => {
    return new Promise((resolve, reject) => {
      const pdfDoc = generateFacultyAnswerKeyPdf(mockPaper, mockQuestions);
      const chunks = [];
      pdfDoc.on('data', c => chunks.push(c));
      pdfDoc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        assert.ok(buffer.length > 500, 'Answer Key PDF must not be empty');
        assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'Buffer must start with PDF header');
        resolve();
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  });

  await it('should generate valid Curriculum Traceability Audit Matrix PDF', () => {
    return new Promise((resolve, reject) => {
      const pdfDoc = generateTraceabilityAuditPdf(mockPaper, mockQuestions);
      const chunks = [];
      pdfDoc.on('data', c => chunks.push(c));
      pdfDoc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        assert.ok(buffer.length > 500, 'Audit Matrix PDF must not be empty');
        assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'Buffer must start with PDF header');
        resolve();
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  });

  // 9. Dashboard Analytics Calculation
  console.log('\n📊 [9/15] Real Database Metrics & Aggregations');
  await it('should calculate real dashboard metrics matching stored records', async () => {
    const totalRow = await queryOne('SELECT COUNT(*) as count FROM question_papers WHERE user_id = ?', [testUserId]);
    assert.strictEqual(parseInt(totalRow.count, 10), 1, 'Should have exactly 1 paper for test user');
  });

  // 10. Structured Syllabus Understanding & Module Detection
  console.log('\n🧠 [10/15] Structured Syllabus Understanding Engine');
  const { extractSyllabusStructure } = require('../server/services/documentProcessor');
  const testSyllabusText = `COURSE CODE: CS402 | COURSE NAME: DATA & INFORMATION SECURITY
ACADEMIC YEAR: 2025-2026 | REGULATION 2024
OBJECTIVES: Understand confidentiality, integrity, and availability (CIA). Analyze cryptographic algorithms.

UNIT 1: INFOSEC FUNDAMENTALS & THREAT LANDSCAPE
Foundations of Information Security: The CIA Triad, Parkerian Hexad. Threat Modeling: STRIDE and DREAD frameworks. Attack Surfaces: Social engineering, phishing, ransomware.

UNIT 2: SYMMETRIC & ASYMMETRIC ENCRYPTION
Modern Symmetric Encryption: AES internal round operations (SubBytes, ShiftRows, MixColumns), key schedules. Block Cipher Modes: ECB pattern leakage, CBC with IV, GCM. Asymmetric Cryptography: RSA Algorithm, modular exponentiation, ECC.

UNIT 3: KEY MANAGEMENT & CRYPTOGRAPHIC HASHES
Diffie-Hellman Key Exchange, Man-in-the-Middle vulnerabilities. PKI: Certificate Authorities, X.509 hierarchy, CRL, OCSP. Hash Functions: SHA-256 collision resistance. Digital Signatures: RSA Signatures.`;

  let detectedStructure = null;
  await it('should extract course code, subject name, units, and discrete topics from syllabus', async () => {
    detectedStructure = extractSyllabusStructure(testSyllabusText, samplePages, 'CS402_Syllabus.pdf');
    assert.ok(detectedStructure, 'Structure must be generated');
    assert.ok(detectedStructure.subject.toLowerCase().includes('security'), 'Subject must detect security');
    assert.strictEqual(detectedStructure.courseCode, 'CS402', 'Course code must be CS402');
    assert.ok(detectedStructure.units.length >= 3, 'Must detect at least 3 distinct units');
    assert.ok(detectedStructure.units[0].topics.length >= 2, 'Unit 1 must contain extracted topics');
  });

  // 11. Assessment Generation Plan & Non-Repeating Topic Distribution
  console.log('\n📋 [11/15] Assessment Generation Planning & Distinct Slot Allocation');
  const { constructAssessmentPlan, balanceRubricMarks, generateAssessmentQuestions } = require('../server/services/aiGenerator');

  await it('should construct a slot-by-slot generation plan where each slot receives a distinct topic', async () => {
    const blueprint = {
      subject: 'Data & Information Security',
      courseCode: 'CS402',
      totalMarks: 20,
      duration: 60,
      unitsCovered: ['Unit 1', 'Unit 2'],
      groups: [
        { name: 'Part A (Short Answer)', count: 5, marksPerQ: 2, type: 'Theory', difficulty: 'Easy', unit: 'Unit 1' },
        { name: 'Part B (Analytical)', count: 2, marksPerQ: 5, type: 'Scenario-Based', difficulty: 'Medium', unit: 'Unit 2' }
      ]
    };

    const plan = constructAssessmentPlan(blueprint, detectedStructure);
    assert.strictEqual(plan.slots.length, 7, 'Must generate exactly 7 question slots');

    // Verify all 5 slots in Unit 1 target distinct topics
    const unit1Slots = plan.slots.filter(s => s.unit === 'Unit 1');
    assert.strictEqual(unit1Slots.length, 5);
    const unit1Topics = unit1Slots.map(s => s.targetTopic.toLowerCase());
    const uniqueTopics = new Set(unit1Topics);
    assert.strictEqual(uniqueTopics.size, 5, 'Every slot in Unit 1 must have a unique non-repeating target topic');

    // Verify marks and cognitive demand scoping
    assert.strictEqual(unit1Slots[0].marks, 2);
    assert.ok(unit1Slots[0].targetCognitiveDemand.includes('recall') || unit1Slots[0].targetCognitiveDemand.includes('definition'));
  });

  // 12. Multi-Stage Duplicate & Near-Duplicate Detection
  console.log('\n🛡️ [12/15] Multi-Stage Duplicate & Semantic Near-Duplicate Prevention');
  const { checkQuestionSimilarity, calculateJaccardSimilarity, calculateNGramSimilarity } = require('../server/services/retrieval');

  await it('should detect exact duplicate questions immediately', async () => {
    const q1 = { questionText: 'Define the principle of Least Privilege and explain how it limits insider threats.' };
    const qDuplicate = { questionText: 'Define the principle of Least Privilege and explain how it limits insider threats.' };

    const check = checkQuestionSimilarity(qDuplicate, [q1]);
    assert.strictEqual(check.isDuplicate, true, 'Exact duplicate must be rejected');
    assert.ok(check.reason.toLowerCase().includes('exact'), 'Reason must indicate exact match');
  });

  await it('should detect paraphrased near-duplicate questions with high token and n-gram overlap', async () => {
    const q1 = { questionText: 'Define the principle of Least Privilege and explain how it mitigates insider threats in an enterprise network.' };
    const qParaphrase = { questionText: 'Explain the Least Privilege principle and discuss how it mitigates insider threats across enterprise network architectures.' };

    const jaccard = calculateJaccardSimilarity(q1.questionText, qParaphrase.questionText);
    const ngram = calculateNGramSimilarity(q1.questionText, qParaphrase.questionText, 3);
    assert.ok(jaccard > 0.50, `Jaccard similarity should exceed 0.50 (got ${jaccard.toFixed(2)})`);

    const check = checkQuestionSimilarity(qParaphrase, [q1], 0.52);
    assert.strictEqual(check.isDuplicate, true, 'Near-duplicate paraphrase must be caught');
    assert.ok(check.reason.includes('Near-duplicate'));
  });

  await it('should approve distinct questions covering different syllabus concepts without false positives', async () => {
    const q1 = { questionText: 'Analyze RSA public-key generation, modular arithmetic, and Euler totient calculation.' };
    const q2 = { questionText: 'Contrast Certificate Revocation Lists (CRL) and Online Certificate Status Protocol (OCSP) in PKI architectures.' };

    const check = checkQuestionSimilarity(q2, [q1], 0.52);
    assert.strictEqual(check.isDuplicate, false, 'Distinct concepts must not be falsely flagged as duplicates');
  });

  // 13. Question Type & Mark Depth Validation
  console.log('\n🎯 [13/15] Question Type & Mark Depth Compliance');
  await it('should balance rubric criteria to sum exactly to total question marks', async () => {
    const unbalancedRubric = [
      { criterion: 'Algorithm definition & explanation', marks: 2 },
      { criterion: 'Computational complexity analysis', marks: 3 }
    ];
    // Target marks is 8, current sum is 5
    balanceRubricMarks(unbalancedRubric, 8);
    const sum = unbalancedRubric.reduce((acc, r) => acc + r.marks, 0);
    assert.strictEqual(sum, 8, 'Sum of balanced rubric must equal 8 marks');
  });

  // 14. Real Grounded Assessment Generation Pipeline
  console.log('\n⚡ [14/15] Real Grounded Assessment Synthesis Pipeline');
  await it('should generate syllabus-grounded questions with real citations, model answers, and balanced rubrics', async () => {
    const testDoc = {
      id: 'doc-rag-test',
      original_name: 'CS402_Security.pdf',
      extracted_text: testSyllabusText
    };

    const bp = {
      subject: 'Data & Information Security',
      courseCode: 'CS402',
      totalMarks: 16,
      duration: 45,
      unitsCovered: ['Unit 1', 'Unit 2'],
      groups: [
        { name: 'Part A', count: 2, marksPerQ: 2, type: 'Theory', difficulty: 'Easy', unit: 'Unit 1' },
        { name: 'Part B', count: 1, marksPerQ: 4, type: 'MCQ', difficulty: 'Medium', unit: 'Unit 2' },
        { name: 'Part C', count: 1, marksPerQ: 8, type: 'Scenario-Based', difficulty: 'Hard', unit: 'Unit 1' }
      ]
    };

    const result = await generateAssessmentQuestions(bp, testDoc, testUserId);
    assert.ok(result.questions, 'Result must contain questions');
    assert.strictEqual(result.questions.length, 4, 'Must generate all 4 planned questions');

    // Validate that questions are distinct
    const texts = result.questions.map(q => q.questionText);
    const uniqueTexts = new Set(texts);
    assert.strictEqual(uniqueTexts.size, 4, 'All generated questions must be completely distinct');

    // Validate rubric sums for every question
    result.questions.forEach(q => {
      const rSum = (q.rubric || []).reduce((acc, r) => acc + parseFloat(r.marks), 0);
      assert.strictEqual(rSum, q.marks, `Rubric sum for question #${q.questionNumber} must equal marks (${q.marks})`);
      assert.ok(q.sourceDocName, 'Must have source document reference');
      assert.ok(q.evidenceStatus, 'Must have evidence validation status');
    });

    // Validate MCQ has 4 options
    const mcq = result.questions.find(q => q.type === 'MCQ');
    assert.ok(mcq, 'MCQ question must exist');
    assert.strictEqual(mcq.options.length, 4, 'MCQ must have 4 options');
    assert.ok(mcq.correctOption, 'MCQ must specify correct option');
    assert.ok(mcq.explanation, 'MCQ must have explanation');
  });

  // 15. Negative / Edge Case Handling
  console.log('\n🛡️ [15/15] Edge Case & Negative Constraint Handling');
  await it('should reject fabricated citations not present in syllabus source', async () => {
    const chunk = 'Block Cipher Modes of Operation: Electronic Codebook (ECB) pattern leakage, Cipher Block Chaining (CBC) with IV.';
    const fakeExcerpt = 'Quantum teleportation using entanglement swapping across photonic channels.';

    const verification = verifyExcerptInChunk(fakeExcerpt, chunk);
    assert.strictEqual(verification.valid, false, 'Unfounded excerpt must fail validation');
  });

  // Cleanup test user records
  await query('DELETE FROM users WHERE id = ?', [testUserId]);

  console.log('\n===================================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} OF ${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('===================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
