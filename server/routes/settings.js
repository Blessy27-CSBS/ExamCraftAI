const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/settings
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const row = await queryOne('SELECT settings_json FROM application_settings WHERE user_id = ?', [req.user.id]);
    let settings = {};
    if (row && row.settings_json) {
      try { settings = JSON.parse(row.settings_json); } catch (e) { settings = {}; }
    } else {
      settings = {
        teacherName: req.user.full_name,
        department: req.user.department,
        institution: req.user.institution,
        defaultDuration: 90,
        defaultMarks: 50,
        defaultExamType: 'Model Examination',
        includeInstructions: true,
        showBloomTags: true,
        includeSignatureLine: true
      };
    }

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve settings.' });
  }
});

/**
 * PUT /api/settings
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const newSettings = req.body;
    const userId = req.user.id;

    // Update settings in database
    await query(`
      INSERT INTO application_settings (id, user_id, settings_json)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET settings_json = ?, updated_at = CURRENT_TIMESTAMP
    `, [
      `set-${userId}`,
      userId,
      JSON.stringify(newSettings),
      JSON.stringify(newSettings)
    ]);

    // Update user profile fields if provided
    if (newSettings.teacherName || newSettings.department || newSettings.institution) {
      await query(`
        UPDATE users
        SET full_name = COALESCE(?, full_name),
            department = COALESCE(?, department),
            institution = COALESCE(?, institution),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newSettings.teacherName, newSettings.department, newSettings.institution, userId]);
    }

    res.json({ success: true, message: 'Settings saved successfully.', settings: newSettings });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ success: false, error: 'Failed to save settings.' });
  }
});

module.exports = router;
