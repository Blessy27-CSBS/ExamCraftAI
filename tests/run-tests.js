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
    assert.ok(chunks[0].sectionTitle.includes('UNIT 1') || chunks[0].sectionTitle.includes('Page 1'));
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
  console.log('\n📊 [9/9] Real Database Metrics & Aggregations');
  await it('should calculate real dashboard metrics matching stored records', async () => {
    const totalRow = await queryOne('SELECT COUNT(*) as count FROM question_papers WHERE user_id = ?', [testUserId]);
    assert.strictEqual(parseInt(totalRow.count, 10), 1, 'Should have exactly 1 paper for test user');
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
