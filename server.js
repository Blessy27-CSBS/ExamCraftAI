/**
 * ExamCraft AI — Academic Assessment Engineering Suite
 * Production-Ready Express & Node.js Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase, getDriver } = require('./server/db/database');

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Header Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allows Lucide, PDF.js, and Tesseract CDN assets
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middlewares
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Rate Limiting for Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api/auth/', authLimiter);

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  maxAge: '1h'
}));

// Serve Uploaded Documents Securely
app.use('/uploads', express.static(path.join(__dirname, 'server', 'storage', 'uploads')));

// Mount REST API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/dashboard', require('./server/routes/dashboard'));
app.use('/api/documents', require('./server/routes/documents'));
app.use('/api/blueprints', require('./server/routes/blueprints'));
app.use('/api/papers', require('./server/routes/papers'));
app.use('/api/questions', require('./server/routes/questions'));
app.use('/api/exports', require('./server/routes/exports'));
app.use('/api/analytics', require('./server/routes/analytics'));
app.use('/api/settings', require('./server/routes/settings'));

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  let aiEngine = 'Local Syllabus RAG (Simulation Fallback)';
  if (process.env.GEMINI_API_KEY) {
    aiEngine = `Google Gemini (${process.env.GEMINI_MODEL || 'gemini-3.8-flash'})`;
  } else if (process.env.OPENAI_API_KEY) {
    aiEngine = `OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`;
  }

  res.json({
    status: 'ONLINE',
    service: 'ExamCraft AI Academic Suite',
    version: '1.0.0',
    databaseDriver: getDriver(),
    aiEngine,
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server & Initialize Database
async function startServer() {
  try {
    console.log('🔄 [ExamCraft AI] Booting Academic Assessment Suite...');
    await initDatabase();

    app.listen(PORT, () => {
      console.log('===================================================================');
      console.log(`🚀 ExamCraft AI Server running live at: http://localhost:${PORT}`);
      console.log(`📚 Database Storage: ${getDriver()?.toUpperCase()}`);
      console.log(`🤖 AI Provider: ${process.env.GEMINI_API_KEY ? 'Google Gemini' : (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Grounded Syllabus RAG')}`);
      console.log('===================================================================');
    });
  } catch (initErr) {
    console.error('❌ [ExamCraft AI] Critical startup failure:', initErr);
    process.exit(1);
  }
}

startServer();

module.exports = app;
