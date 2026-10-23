const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../db/database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, department, institution, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await query(`
      INSERT INTO users (id, email, password_hash, full_name, department, institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      email.toLowerCase().trim(),
      passwordHash,
      fullName.trim(),
      department || 'Faculty Department',
      institution || 'INSTITUTE OF SCIENCE & TECHNOLOGY',
      role === 'admin' ? 'admin' : 'teacher'
    ]);

    // Create default settings for user
    const defaultSettings = {
      teacherName: fullName.trim(),
      department: department || 'Faculty Department',
      institution: institution || 'INSTITUTE OF SCIENCE & TECHNOLOGY',
      defaultDuration: 90,
      defaultMarks: 50,
      defaultExamType: 'Model Examination',
      includeInstructions: true,
      showBloomTags: true,
      includeSignatureLine: true
    };

    await query(`
      INSERT INTO application_settings (id, user_id, settings_json)
      VALUES (?, ?, ?)
    `, [`set-${userId}`, userId, JSON.stringify(defaultSettings)]);

    const token = jwt.sign(
      { userId, email, role: role === 'admin' ? 'admin' : 'teacher' },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        department: department || 'Faculty Department',
        institution: institution || 'INSTITUTE OF SCIENCE & TECHNOLOGY',
        role: role === 'admin' ? 'admin' : 'teacher'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed due to an internal error.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Record login activity
    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      user.id,
      'USER_LOGIN',
      'AUTH',
      user.id,
      `User ${user.full_name} logged in successfully.`
    ]);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        department: user.department,
        institution: user.institution,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed due to an internal error.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', requireAuth, async (req, res) => {
  await query(`
    INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    `act-${Date.now()}`,
    req.user.id,
    'USER_LOGOUT',
    'AUTH',
    req.user.id,
    `User ${req.user.full_name} logged out.`
  ]);

  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
