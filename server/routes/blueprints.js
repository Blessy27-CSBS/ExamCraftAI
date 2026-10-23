const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

/**
 * Validates blueprint parameters
 */
function validateBlueprintData(data) {
  const errors = [];
  const warnings = [];

  const subject = (data.subject || '').trim();
  const totalMarks = parseInt(data.totalMarks || data.total_marks || 0, 10);
  const duration = parseInt(data.duration || data.duration_minutes || 0, 10);
  const groups = Array.isArray(data.groups) ? data.groups : (typeof data.question_groups === 'string' ? JSON.parse(data.question_groups || '[]') : []);

  if (!subject) errors.push('Subject Name is required.');
  if (totalMarks <= 0) errors.push('Target Total Marks must be greater than zero.');
  if (duration <= 0) errors.push('Examination duration must be greater than zero.');

  // Validate Question Groups
  let allocatedMarks = 0;
  let totalQuestions = 0;

  groups.forEach((grp, idx) => {
    const count = parseInt(grp.count || 0, 10);
    const marksPerQ = parseInt(grp.marksPerQ || grp.marks_per_q || 0, 10);
    if (count <= 0) errors.push(`Group #${idx + 1} (${grp.name || 'Section'}) question count must be at least 1.`);
    if (marksPerQ <= 0) errors.push(`Group #${idx + 1} (${grp.name || 'Section'}) marks per question must be at least 1.`);

    allocatedMarks += count * marksPerQ;
    totalQuestions += count;
  });

  if (allocatedMarks !== totalMarks) {
    errors.push(`Allocated marks (${allocatedMarks}) do not equal target total marks (${totalMarks}). Please adjust question counts or group marks.`);
  }

  // Difficulty split
  const easy = parseInt(data.diffEasy || data.difficulty_easy || 0, 10);
  const med = parseInt(data.diffMed || data.difficulty_medium || 0, 10);
  const hard = parseInt(data.diffHard || data.difficulty_hard || 0, 10);
  const diffSum = easy + med + hard;

  if (diffSum !== 100) {
    warnings.push(`Cognitive difficulty split sums to ${diffSum}% instead of 100%.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    allocatedMarks,
    totalQuestions
  };
}

/**
 * POST /api/blueprints/validate
 */
router.post('/validate', requireAuth, (req, res) => {
  const validation = validateBlueprintData(req.body);
  res.json({ success: true, validation });
});

/**
 * POST /api/blueprints
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const validation = validateBlueprintData(data);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Blueprint validation failed.',
        errors: validation.errors
      });
    }

    const userId = req.user.id;
    const bpId = data.id || `bp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const units = Array.isArray(data.unitsCovered) ? data.unitsCovered : [];

    await query(`
      INSERT INTO assessment_blueprints (
        id, user_id, title, subject, course_code, academic_year, exam_type, 
        total_marks, duration_minutes, instructions, difficulty_easy, 
        difficulty_medium, difficulty_hard, units_covered, question_groups
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      bpId,
      userId,
      data.title || `${data.subject} Assessment Blueprint`,
      data.subject,
      data.courseCode || data.course_code || '',
      data.academicYear || data.academic_year || '2025 - 2026',
      data.examType || data.exam_type || 'Model Examination',
      parseInt(data.totalMarks || data.total_marks, 10),
      parseInt(data.duration || data.duration_minutes, 10),
      data.instructions || '',
      parseInt(data.diffEasy || 30, 10),
      parseInt(data.diffMed || 50, 10),
      parseInt(data.diffHard || 20, 10),
      JSON.stringify(units),
      JSON.stringify(groups)
    ]);

    res.status(201).json({
      success: true,
      message: 'Assessment blueprint configured and saved successfully.',
      blueprintId: bpId
    });
  } catch (err) {
    console.error('Save blueprint error:', err);
    res.status(500).json({ success: false, error: 'Failed to save blueprint.' });
  }
});

/**
 * GET /api/blueprints/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const bp = await queryOne('SELECT * FROM assessment_blueprints WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!bp) {
      return res.status(404).json({ success: false, error: 'Blueprint not found.' });
    }

    bp.unitsCovered = JSON.parse(bp.units_covered || '[]');
    bp.groups = JSON.parse(bp.question_groups || '[]');
    res.json({ success: true, blueprint: bp });
  } catch (err) {
    console.error('Get blueprint error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve blueprint.' });
  }
});

module.exports = router;
