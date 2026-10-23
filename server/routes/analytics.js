const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/analytics
 * Real academic analytics computed from stored database records
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Papers by status
    const statusCounts = await query(`
      SELECT status, COUNT(*) as count
      FROM question_papers
      WHERE user_id = ?
      GROUP BY status
    `, [userId]);

    // 2. Questions by difficulty
    const diffCounts = await query(`
      SELECT difficulty, COUNT(*) as count
      FROM questions
      WHERE user_id = ?
      GROUP BY difficulty
    `, [userId]);

    // 3. Questions by Bloom's taxonomy level
    const bloomCounts = await query(`
      SELECT bloom_level as level, COUNT(*) as count
      FROM questions
      WHERE user_id = ? AND bloom_level IS NOT NULL
      GROUP BY bloom_level
    `, [userId]);

    // 4. Questions by question type
    const typeCounts = await query(`
      SELECT question_type as type, COUNT(*) as count
      FROM questions
      WHERE user_id = ?
      GROUP BY question_type
    `, [userId]);

    // 5. Subject distribution
    const subjectCounts = await query(`
      SELECT subject, COUNT(*) as count
      FROM question_papers
      WHERE user_id = ?
      GROUP BY subject
    `, [userId]);

    res.json({
      success: true,
      analytics: {
        statusDistribution: statusCounts,
        difficultyDistribution: diffCounts,
        bloomDistribution: bloomCounts,
        typeDistribution: typeCounts,
        subjectDistribution: subjectCounts
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to compute analytics.' });
  }
});

module.exports = router;
