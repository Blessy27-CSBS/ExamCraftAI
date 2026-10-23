const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/dashboard/metrics
 */
router.get('/metrics', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total papers count
    const totalRow = await queryOne('SELECT COUNT(*) as count FROM question_papers WHERE user_id = ?', [userId]);
    const totalPapers = parseInt(totalRow?.count || 0, 10);

    // 2. Draft papers count
    const draftRow = await queryOne("SELECT COUNT(*) as count FROM question_papers WHERE user_id = ? AND status = 'Draft'", [userId]);
    const draftPapers = parseInt(draftRow?.count || 0, 10);

    // 3. In review papers count
    const reviewRow = await queryOne("SELECT COUNT(*) as count FROM question_papers WHERE user_id = ? AND status = 'In Review'", [userId]);
    const inReviewPapers = parseInt(reviewRow?.count || 0, 10);

    // 4. Approved papers count
    const approvedRow = await queryOne("SELECT COUNT(*) as count FROM question_papers WHERE user_id = ? AND status = 'Approved'", [userId]);
    const approvedPapers = parseInt(approvedRow?.count || 0, 10);

    // 5. Total questions generated
    const questionsRow = await queryOne('SELECT COUNT(*) as count FROM questions WHERE user_id = ?', [userId]);
    const totalQuestions = parseInt(questionsRow?.count || 0, 10);

    // 6. Recent question papers
    const recentPapers = await query(`
      SELECT id, title, subject, course_code, exam_type, total_marks, duration_minutes, status, created_at, updated_at
      FROM question_papers
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 6
    `, [userId]);

    // 7. Recent activity logs
    const recentActivity = await query(`
      SELECT id, action, entity_type, entity_id, details, created_at
      FROM activity_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 8
    `, [userId]);

    res.json({
      success: true,
      metrics: {
        totalPapers,
        draftPapers,
        inReviewPapers,
        approvedPapers,
        totalQuestions
      },
      recentPapers,
      recentActivity
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics.' });
  }
});

module.exports = router;
