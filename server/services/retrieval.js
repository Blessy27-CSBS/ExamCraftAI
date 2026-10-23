const { query } = require('../db/database');

/**
 * Retrieves the most relevant document chunks for a specific topic, unit, and query requirements
 */
async function retrieveContextChunks(userId, subject, unit, queryTerms = '', docId = null, limit = 5) {
  let sql = `
    SELECT c.id, c.document_id, c.chunk_index, c.page_number, c.section_title, c.content, d.original_name as doc_name
    FROM document_chunks c
    JOIN source_documents d ON c.document_id = d.id
    WHERE c.user_id = ?
  `;
  const params = [userId];

  if (docId) {
    sql += ` AND c.document_id = ?`;
    params.push(docId);
  }

  const chunks = await query(sql, params);
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Tokenize search criteria
  const searchKeywords = `${subject || ''} ${unit || ''} ${queryTerms || ''}`
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Score chunks using TF-IDF style keyword match
  const scoredChunks = chunks.map(chunk => {
    const textLower = (chunk.content + ' ' + (chunk.section_title || '')).toLowerCase();
    let score = 0;

    for (const kw of searchKeywords) {
      if (textLower.includes(kw)) {
        score += 2.0;
        // Boost if in section title
        if ((chunk.section_title || '').toLowerCase().includes(kw)) {
          score += 3.0;
        }
      }
    }

    // Boost if unit matches chunk section
    if (unit && textLower.includes(unit.toLowerCase())) {
      score += 4.0;
    }

    return { ...chunk, score };
  });

  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, limit);
}

/**
 * Validates that an excerpt genuinely exists within a document chunk
 */
function verifyExcerptInChunk(excerpt, chunkContent) {
  if (!excerpt || !chunkContent) return { valid: false, cleanExcerpt: '' };

  const normExcerpt = excerpt.toLowerCase().replace(/\s+/g, ' ').trim();
  const normChunk = chunkContent.toLowerCase().replace(/\s+/g, ' ');

  if (normChunk.includes(normExcerpt)) {
    return { valid: true, cleanExcerpt: excerpt.trim() };
  }

  // Check fuzzy / sentence overlap
  const words = normExcerpt.split(' ').filter(w => w.length > 3);
  let matches = 0;
  for (const w of words) {
    if (normChunk.includes(w)) matches++;
  }

  const ratio = words.length > 0 ? matches / words.length : 0;
  if (ratio >= 0.75) {
    return { valid: true, cleanExcerpt: excerpt.trim() };
  }

  return { valid: false, cleanExcerpt: '' };
}

module.exports = {
  retrieveContextChunks,
  verifyExcerptInChunk
};
