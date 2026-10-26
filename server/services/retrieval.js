const { query } = require('../db/database');

// Standard academic stop words to filter for accurate tokenization
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'which', 'what', 'when',
  'where', 'how', 'why', 'who', 'state', 'define', 'explain', 'discuss', 'describe',
  'analyze', 'evaluate', 'given', 'using', 'calculate', 'derive', 'compare', 'contrast',
  'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'does', 'did', 'its',
  'can', 'could', 'should', 'would', 'into', 'such', 'than', 'then', 'each', 'all',
  'both', 'any', 'some', 'under', 'over', 'about', 'between', 'through'
]);

/**
 * Retrieves the most relevant document chunks for a specific topic, unit, and query requirements
 */
async function retrieveContextChunks(userId, subject, unit, queryTerms = '', docId = null, limit = 4) {
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

  // Tokenize topic and search terms
  const rawTerms = `${queryTerms || ''} ${unit || ''} ${subject || ''}`
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const topicKeywords = Array.from(new Set(rawTerms));
  const cleanTargetTopic = (queryTerms || '').toLowerCase().trim();

  // Score chunks using TF-IDF style keyword match and unit grounding
  const scoredChunks = chunks.map(chunk => {
    const textLower = chunk.content.toLowerCase();
    const sectionLower = (chunk.section_title || '').toLowerCase();
    let score = 0;

    // 1. Exact phrase boost
    if (cleanTargetTopic.length > 4 && (textLower.includes(cleanTargetTopic) || sectionLower.includes(cleanTargetTopic))) {
      score += 25.0;
    }

    // 2. Unit boundary grounding
    const unitClean = (unit || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const chunkSectionClean = sectionLower.replace(/[^a-z0-9]/g, '');
    if (unitClean && chunkSectionClean.includes(unitClean)) {
      score += 15.0;
    }

    // 3. Keyword matches
    for (const kw of topicKeywords) {
      if (sectionLower.includes(kw)) {
        score += 6.0;
      }
      if (textLower.includes(kw)) {
        // Frequency count capped at 5
        const count = Math.min(5, (textLower.match(new RegExp('\\b' + kw + '\\b', 'g')) || []).length);
        score += count * 2.5;
      }
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
  const words = normExcerpt.split(' ').filter(w => w.length > 3 && !STOP_WORDS.has(w));
  let matches = 0;
  for (const w of words) {
    if (normChunk.includes(w)) matches++;
  }

  const ratio = words.length > 0 ? matches / words.length : 0;
  if (ratio >= 0.70) {
    return { valid: true, cleanExcerpt: excerpt.trim() };
  }

  return { valid: false, cleanExcerpt: '' };
}

/**
 * Normalizes text for comparison by removing punctuation and lowercasing
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts non-stopword tokens of length >= 3
 */
function getWordTokens(text) {
  const norm = normalizeText(text);
  return norm
    .split(' ')
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Calculates token-level Jaccard similarity between two strings
 * Jaccard = |A ∩ B| / |A ∪ B|
 */
function calculateJaccardSimilarity(textA, textB) {
  const tokensA = new Set(getWordTokens(textA));
  const tokensB = new Set(getWordTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersectionCount++;
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Calculates word n-gram overlap between two strings (e.g. 3-grams)
 */
function calculateNGramSimilarity(textA, textB, n = 3) {
  const wordsA = getWordTokens(textA);
  const wordsB = getWordTokens(textB);

  if (wordsA.length < n || wordsB.length < n) {
    return calculateJaccardSimilarity(textA, textB);
  }

  const ngramsA = new Set();
  for (let i = 0; i <= wordsA.length - n; i++) {
    ngramsA.add(wordsA.slice(i, i + n).join(' '));
  }

  const ngramsB = new Set();
  for (let i = 0; i <= wordsB.length - n; i++) {
    ngramsB.add(wordsB.slice(i, i + n).join(' '));
  }

  let intersection = 0;
  for (const g of ngramsA) {
    if (ngramsB.has(g)) intersection++;
  }

  const union = new Set([...ngramsA, ...ngramsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Comprehensive duplicate detection:
 * Detects exact duplicates, paraphrased duplicates, and concept overlaps
 */
function checkQuestionSimilarity(candidateQuestion, existingQuestions = [], threshold = 0.52) {
  if (!candidateQuestion || !existingQuestions || existingQuestions.length === 0) {
    return { isDuplicate: false, maxSimilarity: 0, duplicateOf: null, reason: '' };
  }

  const candText = candidateQuestion.questionText || candidateQuestion.text || '';
  const candConcepts = (candidateQuestion.keyConcepts || '').toLowerCase();
  const candNorm = normalizeText(candText);

  let maxSimilarity = 0;
  let mostSimilarQ = null;
  let reason = '';

  for (const prevQ of existingQuestions) {
    const prevText = prevQ.questionText || prevQ.text || '';
    const prevNorm = normalizeText(prevText);

    // 1. Exact match check
    if (candNorm === prevNorm && candNorm.length > 10) {
      return {
        isDuplicate: true,
        maxSimilarity: 1.0,
        duplicateOf: prevQ,
        reason: `Exact identical prompt match with Q#${prevQ.number || prevQ.questionNumber || 'existing'}`
      };
    }

    // 2. Token Jaccard similarity
    const jaccard = calculateJaccardSimilarity(candText, prevText);

    // 3. 3-Gram similarity
    const ngramSim = calculateNGramSimilarity(candText, prevText, 3);

    // 4. Key concepts overlap
    const prevConcepts = (prevQ.keyConcepts || '').toLowerCase();
    let conceptOverlap = 0;
    if (candConcepts && prevConcepts) {
      conceptOverlap = calculateJaccardSimilarity(candConcepts, prevConcepts);
    }

    // Prompt text similarity (Jaccard token overlap and 3-gram sequence matching)
    const compositeScore = Math.max(jaccard, ngramSim * 1.05);

    if (compositeScore > maxSimilarity) {
      maxSimilarity = compositeScore;
      mostSimilarQ = prevQ;
    }

    // Flag if prompt text similarity exceeds threshold or identical concept with high prompt similarity
    if (compositeScore >= threshold || (conceptOverlap >= 0.80 && jaccard >= 0.48)) {
      reason = `Near-duplicate detected (${Math.round(compositeScore * 100)}% text similarity) with Q#${prevQ.number || prevQ.questionNumber || 'prior'}`;
      return {
        isDuplicate: true,
        maxSimilarity: compositeScore,
        duplicateOf: prevQ,
        reason
      };
    }
  }

  return {
    isDuplicate: false,
    maxSimilarity,
    duplicateOf: mostSimilarQ,
    reason: ''
  };
}

module.exports = {
  retrieveContextChunks,
  verifyExcerptInChunk,
  calculateJaccardSimilarity,
  calculateNGramSimilarity,
  checkQuestionSimilarity
};
