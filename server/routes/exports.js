const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const {
  generateStudentQuestionPaperPdf,
  generateFacultyAnswerKeyPdf,
  generateTraceabilityAuditPdf
} = require('../services/pdfService');

/**
 * Helper to fetch complete paper and questions
 */
async function getPaperWithQuestions(paperId, userId, queryOverrides = {}) {
  const paper = await queryOne(`
    SELECT * FROM question_papers WHERE id = ? AND user_id = ?
  `, [paperId, userId]);

  if (!paper) return null;

  if (queryOverrides.instName) paper.institution_name = queryOverrides.instName.trim();
  if (queryOverrides.deptName) paper.department_name = queryOverrides.deptName.trim();
  if (queryOverrides.courseCode) paper.course_code = queryOverrides.courseCode.trim();
  if (queryOverrides.subject) paper.subject = queryOverrides.subject.trim();
  if (queryOverrides.examDate) paper.exam_date = queryOverrides.examDate.trim();

  const questions = await query(`
    SELECT q.*, a.model_answer, a.key_concepts, a.expected_points
    FROM questions q
    LEFT JOIN answer_scripts a ON q.id = a.question_id
    WHERE q.paper_id = ?
    ORDER BY q.question_number ASC
  `, [paper.id]);

  for (const q of questions) {
    if (typeof q.options === 'string') {
      try { q.options = JSON.parse(q.options); } catch (e) { q.options = null; }
    }
    const rubric = await query(`
      SELECT criterion_description, marks_allocated
      FROM marking_criteria
      WHERE question_id = ?
      ORDER BY order_index ASC
    `, [q.id]);
    q.rubric = rubric;
  }

  return { paper, questions };
}

/**
 * GET /api/exports/:id/student-pdf
 */
router.get('/:id/student-pdf', requireAuth, async (req, res) => {
  try {
    const data = await getPaperWithQuestions(req.params.id, req.user.id, req.query);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    const { paper, questions } = data;
    const cleanName = (paper.title || 'Question_Paper').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_Student_Paper.pdf"`);

    const pdfDoc = generateStudentQuestionPaperPdf(paper, questions);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('Export student PDF error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate student PDF.' });
  }
});

/**
 * GET /api/exports/:id/faculty-pdf
 */
router.get('/:id/faculty-pdf', requireAuth, async (req, res) => {
  try {
    const data = await getPaperWithQuestions(req.params.id, req.user.id, req.query);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    const { paper, questions } = data;
    const cleanName = (paper.title || 'Question_Paper').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_Faculty_Answer_Key.pdf"`);

    const pdfDoc = generateFacultyAnswerKeyPdf(paper, questions);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('Export faculty PDF error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate faculty answer key PDF.' });
  }
});

/**
 * GET /api/exports/:id/audit-pdf
 */
router.get('/:id/audit-pdf', requireAuth, async (req, res) => {
  try {
    const data = await getPaperWithQuestions(req.params.id, req.user.id, req.query);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    const { paper, questions } = data;
    const cleanName = (paper.title || 'Question_Paper').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_Traceability_Audit.pdf"`);

    const pdfDoc = generateTraceabilityAuditPdf(paper, questions);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('Export audit PDF error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate traceability audit PDF.' });
  }
});

module.exports = router;
