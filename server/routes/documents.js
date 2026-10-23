const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, queryOne, transaction } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { processDocumentFile, chunkDocumentText } = require('../services/documentProcessor');

// Configure Multer storage
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './server/storage/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT documents are supported.'));
    }
  }
});

/**
 * POST /api/documents/upload
 */
router.post('/upload', requireAuth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file provided.' });
    }

    const { path: tempPath, originalname, size, mimetype, filename } = req.file;
    const userId = req.user.id;
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const formattedSize = (size / (1024 * 1024)).toFixed(2) + ' MB';

    // Extract text and page structures
    let extractionResult;
    try {
      extractionResult = await processDocumentFile(tempPath, mimetype, originalname);
    } catch (extractErr) {
      console.error('Extraction error:', extractErr);
      return res.status(422).json({
        success: false,
        error: `Failed to extract text from document: ${extractErr.message}`
      });
    }

    const { pageCount, fullText, pages, isScanned, status } = extractionResult;

    // Save document into database
    await query(`
      INSERT INTO source_documents (
        id, user_id, filename, original_name, file_size, mime_type, 
        page_count, status, storage_path, extracted_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId,
      userId,
      filename,
      originalname,
      formattedSize,
      mimetype,
      pageCount,
      status,
      tempPath,
      fullText
    ]);

    // Chunk and index text if readable
    if (!isScanned && pages && pages.length > 0) {
      const chunks = chunkDocumentText(pages, docId, userId);
      for (const chunk of chunks) {
        await query(`
          INSERT INTO document_chunks (
            id, document_id, user_id, chunk_index, page_number, section_title, content
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          chunk.id,
          chunk.documentId,
          chunk.userId,
          chunk.chunkIndex,
          chunk.pageNumber,
          chunk.sectionTitle,
          chunk.content
        ]);
      }
    }

    // Record activity
    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      userId,
      'DOCUMENT_UPLOAD',
      'DOCUMENT',
      docId,
      `Uploaded and processed curriculum document: ${originalname} (${pageCount} pages).`
    ]);

    res.status(201).json({
      success: true,
      message: isScanned 
        ? 'Document uploaded. Scanned image PDF detected (OCR required).' 
        : 'Document uploaded and curriculum text extracted successfully.',
      document: {
        id: docId,
        name: originalname,
        fileSize: formattedSize,
        pageCount,
        status,
        isScanned,
        extractedTextPreview: fullText.slice(0, 500)
      }
    });

  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Document upload failed.' });
  }
});

/**
 * GET /api/documents
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const docs = await query(`
      SELECT id, original_name as name, file_size as fileSize, page_count as pages, 
             status, created_at as uploadDate, (extracted_text IS NOT NULL) as hasText
      FROM source_documents
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve documents.' });
  }
});

/**
 * GET /api/documents/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await queryOne(`
      SELECT id, original_name as name, file_size as fileSize, page_count as pages, 
             status, storage_path, extracted_text as text, created_at as uploadDate
      FROM source_documents
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const chunks = await query(`
      SELECT id, chunk_index as chunkIndex, page_number as pageNumber, section_title as sectionTitle, content
      FROM document_chunks
      WHERE document_id = ?
      ORDER BY chunk_index ASC
    `, [doc.id]);

    res.json({ success: true, document: { ...doc, chunks } });
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve document details.' });
  }
});

/**
 * DELETE /api/documents/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await queryOne('SELECT id, storage_path, original_name FROM source_documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    // Delete disk file
    if (doc.storage_path && fs.existsSync(doc.storage_path)) {
      try {
        fs.unlinkSync(doc.storage_path);
      } catch (fErr) {
        console.warn('Could not delete storage file:', fErr.message);
      }
    }

    // Delete from database (cascades to document_chunks)
    await query('DELETE FROM source_documents WHERE id = ?', [doc.id]);

    // Record activity
    await query(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `act-${Date.now()}`,
      req.user.id,
      'DOCUMENT_DELETE',
      'DOCUMENT',
      doc.id,
      `Deleted document: ${doc.original_name}.`
    ]);

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete document.' });
  }
});

module.exports = router;
