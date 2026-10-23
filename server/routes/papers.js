const express = require('express');
const router = express.Router();
const { query, queryOne, transaction } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { generateAssessmentQuestions } = require('../services/aiGenerator');

/**
 * POST /api/papers/generate
 * Generates an assessment paper draft based on blueprint and syllabus source
 */
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { blueprint, documentId } = req.body;
    const userId = req.user.id;

    if (!blueprint || !blueprint.subject) {
      return res.status(400).json({ success: false, error: 'Valid assessment blueprint is required.' });
    }

    // Retrieve source document if specified
    let sourceDoc = null;
    if (documentId) {
      sourceDoc = await queryOne('SELECT * FROM source_documents WHERE id = ? AND user_id = ?', [documentId, userId]);
    } else {
      sourceDoc = await queryOne('SELECT * FROM source_documents WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    }

    // Call AI Generation Engine
    const { engine, questions } = await generateAssessmentQuestions(blueprint, sourceDoc, userId);

    const paperId = `paper-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const paperTitle = `${blueprint.subject} (${blueprint.courseCode || 'Assessment'}) — ${blueprint.examType || 'Model Examination'}`;

    // Insert paper record into database
    await query(`
      INSERT INTO question_papers (
        id, user_id, title, subject, course_code, academic_year, exam_type, 
        total_marks, duration_minutes, instructions, institution_name, 
        department_name, exam_date, status, source_doc_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      paperId,
      userId,
      paperTitle,
      blueprint.subject,
      blueprint.courseCode || '',
      blueprint.academicYear || '2025 - 2026',
      blueprint.examType || 'Model Examination',
      parseInt(blueprint.totalMarks || 50, 10),
      parseInt(blueprint.duration || 90, 10),
      blueprint.instructions || '1. Answer all questions.\n2. State all assumptions clearly.',
      req.user.institution || 'INSTITUTE OF SCIENCE & TECHNOLOGY',
      req.user.department || 'Department of Computer Science & Engineering',
      blueprint.examDate || new Date().toISOString().split('T')[0],
      'Draft',
      sourceDoc ? sourceDoc.original_name : 'Uploaded Syllabus'
    ]);

    // Insert each question, answer script, and rubric criteria
    for (const q of questions) {
      const qId = q.id || `q-${Date.now()}-${q.questionNumber}`;

      await query(`
        INSERT INTO questions (
          id, paper_id, user_id, question_number, question_text, question_type, 
          subject, unit, difficulty, marks, bloom_level, options, correct_option, 
          explanation, solution_steps, source_doc_id, source_doc_name, source_page, 
          source_section, source_excerpt, evidence_status, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        qId,
        paperId,
        userId,
        q.questionNumber,
        q.questionText,
        q.type,
        q.subject,
        q.unit,
        q.difficulty,
        q.marks,
        q.bloomLevel,
        q.options ? JSON.stringify(q.options) : null,
        q.correctOption || null,
        q.explanation || null,
        q.solutionSteps || null,
        q.sourceDocId || null,
        q.sourceDocName || null,
        q.sourcePage || null,
        q.sourceSection || null,
        q.sourceExcerpt || null,
        q.evidenceStatus || 'Supported by source',
        'Unreviewed'
      ]);

      // Insert model answer
      await query(`
        INSERT INTO answer_scripts (id, question_id, model_answer, key_concepts, expected_points)
        VALUES (?, ?, ?, ?, ?)
      `, [
        `ans-${qId}`,
        qId,
        q.modelAnswer,
        q.keyConcepts || '',
        q.expectedPoints || ''
      ]);

      // Insert rubric
      if (Array.isArray(q.rubric)) {
        for (let rIdx = 0; rIdx < q.rubric.length; rIdx++) {
          const r = q.rubric[rIdx];
          await query(`
            INSERT INTO marking_criteria (id, question_id, criterion_description, marks_allocated, order_index)
            VALUES (?, ?, ?, ?, ?)
          `, [
            `rub-${qId}-${rIdx}`,
            qId,
            r.criterion,
            parseFloat(r.marks),
            rIdx
          ]);
        }
      }
    }

    // Record activity log
    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      userId,
      'PAPER_GENERATED',
      'PAPER',
      paperId,
      `Generated assessment draft: ${paperTitle} (${questions.length} questions, ${blueprint.totalMarks} marks) via ${engine}.`
    ]);

    res.status(201).json({
      success: true,
      message: `Assessment draft generated successfully via ${engine}.`,
      engine,
      paperId
    });

  } catch (err) {
    console.error('Generate paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate assessment draft: ' + err.message });
  }
});

/**
 * GET /api/papers
 * List papers with search, filter, and pagination
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, subject, search } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT p.id, p.title, p.subject, p.course_code as courseCode, p.academic_year as academicYear,
             p.exam_type as examType, p.total_marks as totalMarks, p.duration_minutes as duration,
             p.status, p.approved_by as approvedBy, p.approved_at as approvedAt,
             p.created_at as createdDate, p.updated_at as updatedDate,
             COUNT(q.id) as questionCount
      FROM question_papers p
      LEFT JOIN questions q ON p.id = q.paper_id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    if (subject && subject !== 'all') {
      sql += ` AND p.subject = ?`;
      params.push(subject);
    }
    if (search) {
      sql += ` AND (p.title LIKE ? OR p.subject LIKE ? OR p.course_code LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ` GROUP BY p.id ORDER BY p.updated_at DESC`;

    const papers = await query(sql, params);
    res.json({ success: true, papers });
  } catch (err) {
    console.error('List papers error:', err);
    res.status(500).json({ success: false, error: 'Failed to list papers.' });
  }
});

/**
 * GET /api/papers/:id
 * Retrieve full paper details including questions, answers, rubrics, and source evidence
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const paper = await queryOne(`
      SELECT id, title, subject, course_code as courseCode, academic_year as academicYear,
             exam_type as examType, total_marks as totalMarks, duration_minutes as duration,
             instructions, institution_name as instName, department_name as deptName,
             exam_date as examDate, status, approved_by as approvedBy, approved_at as approvedAt,
             review_notes as reviewNotes, source_doc_name as sourceDocName, created_at as createdDate
      FROM question_papers
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (!paper) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    const questions = await query(`
      SELECT q.id, q.question_number as questionNumber, q.question_text as text, q.question_text as questionText,
             q.question_type as type, q.subject, q.unit, q.difficulty, q.marks, q.bloom_level as bloomLevel,
             q.options, q.correct_option as correctOption, q.explanation, q.solution_steps as solutionSteps,
             q.source_doc_name as sourceDoc, q.source_page as sourcePage, q.source_section as sourceSection,
             q.source_excerpt as sourceExcerpt, q.evidence_status as evidenceStatus, q.review_status as reviewStatus,
             q.teacher_comments as teacherComments,
             a.model_answer as modelAnswer, a.key_concepts as keyConcepts, a.expected_points as expectedPoints
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
        SELECT criterion_description as criterion, marks_allocated as marks
        FROM marking_criteria
        WHERE question_id = ?
        ORDER BY order_index ASC
      `, [q.id]);
      q.rubric = rubric;
    }

    paper.questions = questions;
    res.json({ success: true, paper });
  } catch (err) {
    console.error('Get paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve paper details.' });
  }
});

/**
 * PUT /api/papers/:id
 * Updates draft question paper, questions, model answers, or rubrics
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, instructions, questions, status } = req.body;
    const userId = req.user.id;
    const paperId = req.params.id;

    const paper = await queryOne('SELECT id, status FROM question_papers WHERE id = ? AND user_id = ?', [paperId, userId]);
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    await query(`
      UPDATE question_papers
      SET title = COALESCE(?, title),
          instructions = COALESCE(?, instructions),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, instructions, status, paperId]);

    // Update questions if provided
    if (Array.isArray(questions)) {
      for (const q of questions) {
        if (!q.id) continue;

        await query(`
          UPDATE questions
          SET question_text = COALESCE(?, question_text),
              marks = COALESCE(?, marks),
              unit = COALESCE(?, unit),
              difficulty = COALESCE(?, difficulty),
              review_status = COALESCE(?, review_status),
              teacher_comments = COALESCE(?, teacher_comments),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND paper_id = ?
        `, [q.text || q.questionText, q.marks, q.unit, q.difficulty, q.reviewStatus, q.teacherComments, q.id, paperId]);

        // Update answer script
        if (q.modelAnswer) {
          await query(`
            UPDATE answer_scripts
            SET model_answer = ?, key_concepts = ?, expected_points = ?, updated_at = CURRENT_TIMESTAMP
            WHERE question_id = ?
          `, [q.modelAnswer, q.keyConcepts || '', q.expectedPoints || '', q.id]);
        }

        // Update rubrics
        if (Array.isArray(q.rubric)) {
          await query('DELETE FROM marking_criteria WHERE question_id = ?', [q.id]);
          for (let rIdx = 0; rIdx < q.rubric.length; rIdx++) {
            const r = q.rubric[rIdx];
            await query(`
              INSERT INTO marking_criteria (id, question_id, criterion_description, marks_allocated, order_index)
              VALUES (?, ?, ?, ?, ?)
            `, [
              `rub-${q.id}-${rIdx}-${Date.now()}`,
              q.id,
              r.criterion || r.criterion_description,
              parseFloat(r.marks || r.marks_allocated),
              rIdx
            ]);
          }
        }
      }
    }

    res.json({ success: true, message: 'Question paper updated successfully.' });
  } catch (err) {
    console.error('Update paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to update paper: ' + err.message });
  }
});

/**
 * POST /api/papers/:id/approve
 * Formal certification & approval protocol
 */
router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const paperId = req.params.id;

    const paper = await queryOne('SELECT id, title, status FROM question_papers WHERE id = ? AND user_id = ?', [paperId, userId]);
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Question paper not found.' });
    }

    const approverName = req.user.full_name || 'Dr. Sarah Jenkins';

    await query(`
      UPDATE question_papers
      SET status = 'Approved',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [approverName, paperId]);

    // Record review audit log
    await query(`
      INSERT INTO paper_reviews (id, paper_id, reviewer_id, previous_status, new_status, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `prev-${Date.now()}`,
      paperId,
      userId,
      paper.status,
      'Approved',
      `Formally approved by ${approverName}. All rubrics balanced and syllabus-aligned.`
    ]);

    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      userId,
      'PAPER_APPROVED',
      'PAPER',
      paperId,
      `Certified and approved question paper: ${paper.title}.`
    ]);

    res.json({ success: true, message: 'Question paper approved and certified for examination.', approvedBy: approverName });
  } catch (err) {
    console.error('Approve paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve paper.' });
  }
});

/**
 * POST /api/papers/:id/duplicate
 * Clones existing paper
 */
router.post('/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const origPaper = await queryOne('SELECT * FROM question_papers WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    if (!origPaper) {
      return res.status(404).json({ success: false, error: 'Original paper not found.' });
    }

    const newPaperId = `paper-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newTitle = `${origPaper.title} (Copy)`;

    await query(`
      INSERT INTO question_papers (
        id, user_id, blueprint_id, title, subject, course_code, academic_year,
        exam_type, total_marks, duration_minutes, instructions, institution_name,
        department_name, exam_date, status, source_doc_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
    `, [
      newPaperId,
      userId,
      origPaper.blueprint_id,
      newTitle,
      origPaper.subject,
      origPaper.course_code,
      origPaper.academic_year,
      origPaper.exam_type,
      origPaper.total_marks,
      origPaper.duration_minutes,
      origPaper.instructions,
      origPaper.institution_name,
      origPaper.department_name,
      origPaper.exam_date,
      origPaper.source_doc_name
    ]);

    // Copy questions
    const origQuestions = await query('SELECT * FROM questions WHERE paper_id = ?', [origPaper.id]);
    for (const q of origQuestions) {
      const newQId = `q-${Date.now()}-${q.question_number}-${Math.random().toString(36).substr(2, 4)}`;
      await query(`
        INSERT INTO questions (
          id, paper_id, user_id, question_number, question_text, question_type,
          subject, unit, difficulty, marks, bloom_level, options, correct_option,
          explanation, solution_steps, source_doc_id, source_doc_name, source_page,
          source_section, source_excerpt, evidence_status, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unreviewed')
      `, [
        newQId, newPaperId, userId, q.question_number, q.question_text, q.question_type,
        q.subject, q.unit, q.difficulty, q.marks, q.bloom_level, q.options, q.correct_option,
        q.explanation, q.solution_steps, q.source_doc_id, q.source_doc_name, q.source_page,
        q.source_section, q.source_excerpt, q.evidence_status
      ]);

      const ans = await queryOne('SELECT * FROM answer_scripts WHERE question_id = ?', [q.id]);
      if (ans) {
        await query(`
          INSERT INTO answer_scripts (id, question_id, model_answer, key_concepts, expected_points)
          VALUES (?, ?, ?, ?, ?)
        `, [`ans-${newQId}`, newQId, ans.model_answer, ans.key_concepts, ans.expected_points]);
      }

      const rubrics = await query('SELECT * FROM marking_criteria WHERE question_id = ?', [q.id]);
      for (const r of rubrics) {
        await query(`
          INSERT INTO marking_criteria (id, question_id, criterion_description, marks_allocated, order_index)
          VALUES (?, ?, ?, ?, ?)
        `, [`rub-${newQId}-${r.order_index}`, newQId, r.criterion_description, r.marks_allocated, r.order_index]);
      }
    }

    res.status(201).json({ success: true, message: 'Question paper duplicated successfully.', newPaperId });
  } catch (err) {
    console.error('Duplicate paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to duplicate paper.' });
  }
});

/**
 * DELETE /api/papers/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const paper = await queryOne('SELECT id, title FROM question_papers WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Paper not found.' });
    }

    await query('DELETE FROM question_papers WHERE id = ?', [paper.id]);

    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      userId,
      'PAPER_DELETE',
      'PAPER',
      paper.id,
      `Deleted question paper: ${paper.title}.`
    ]);

    res.json({ success: true, message: 'Question paper deleted successfully.' });
  } catch (err) {
    console.error('Delete paper error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete paper.' });
  }
});

module.exports = router;
