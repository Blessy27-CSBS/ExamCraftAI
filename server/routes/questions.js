const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/questions/bank
 * Retrieve reusable questions with filters
 */
router.get('/bank', requireAuth, async (req, res) => {
  try {
    const { subject, unit, difficulty, type, search } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT q.id, q.question_number as questionNumber, q.question_text as text, q.question_text as questionText,
             q.question_type as type, q.subject, q.unit, q.difficulty, q.marks, q.bloom_level as bloomLevel,
             q.options, q.correct_option as correctOption, q.explanation, q.solution_steps as solutionSteps,
             q.source_doc_name as sourceDoc, q.source_page as sourcePage, q.source_section as sourceSection,
             q.source_excerpt as sourceExcerpt, q.evidence_status as evidenceStatus, q.review_status as reviewStatus,
             a.model_answer as modelAnswer, a.key_concepts as keyConcepts, a.expected_points as expectedPoints
      FROM questions q
      LEFT JOIN answer_scripts a ON q.id = a.question_id
      WHERE q.user_id = ?
    `;
    const params = [userId];

    if (subject && subject !== 'all') {
      sql += ` AND q.subject = ?`;
      params.push(subject);
    }
    if (unit && unit !== 'all') {
      sql += ` AND q.unit = ?`;
      params.push(unit);
    }
    if (difficulty && difficulty !== 'all') {
      sql += ` AND q.difficulty = ?`;
      params.push(difficulty);
    }
    if (type && type !== 'all') {
      sql += ` AND q.question_type = ?`;
      params.push(type);
    }
    if (search) {
      sql += ` AND (q.question_text LIKE ? OR q.subject LIKE ? OR q.unit LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ` ORDER BY q.created_at DESC`;

    const questions = await query(sql, params);

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

    res.json({ success: true, questions });
  } catch (err) {
    console.error('List question bank error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve question bank items.' });
  }
});

/**
 * POST /api/questions/bank
 * Add vetted question to bank
 */
router.post('/bank', requireAuth, async (req, res) => {
  try {
    const q = req.body;
    const userId = req.user.id;
    const qId = q.id || `qb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await query(`
      INSERT INTO questions (
        id, paper_id, user_id, question_number, question_text, question_type,
        subject, unit, difficulty, marks, bloom_level, options, correct_option,
        explanation, solution_steps, source_doc_name, source_page, source_section,
        source_excerpt, evidence_status, review_status
      ) VALUES (?, NULL, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
    `, [
      qId,
      userId,
      q.text || q.questionText,
      q.type || 'Theory',
      q.subject || 'General Engineering',
      q.unit || 'Unit 1',
      q.difficulty || 'Medium',
      parseInt(q.marks || 2, 10),
      q.bloomLevel || 'Understand',
      q.options ? JSON.stringify(q.options) : null,
      q.correctOption || null,
      q.explanation || null,
      q.solutionSteps || null,
      q.sourceDoc || 'Curriculum Syllabus',
      q.sourcePage || 'Page 1',
      q.sourceSection || 'Section 1',
      q.sourceExcerpt || 'Directly aligned to course module specifications.',
      q.evidenceStatus || 'Supported by source'
    ]);

    await query(`
      INSERT INTO answer_scripts (id, question_id, model_answer, key_concepts, expected_points)
      VALUES (?, ?, ?, ?, ?)
    `, [
      `ans-${qId}`,
      qId,
      q.modelAnswer || 'Comprehensive model answer.',
      q.keyConcepts || '',
      q.expectedPoints || ''
    ]);

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

    res.status(201).json({ success: true, message: 'Question saved to bank.', questionId: qId });
  } catch (err) {
    console.error('Add to question bank error:', err);
    res.status(500).json({ success: false, error: 'Failed to add question to bank.' });
  }
});

/**
 * DELETE /api/questions/bank/:id
 */
router.delete('/bank/:id', requireAuth, async (req, res) => {
  try {
    const q = await queryOne('SELECT id FROM questions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!q) {
      return res.status(404).json({ success: false, error: 'Question not found.' });
    }

    await query('DELETE FROM questions WHERE id = ?', [q.id]);
    res.json({ success: true, message: 'Question removed from question bank.' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete question.' });
  }
});

module.exports = router;
