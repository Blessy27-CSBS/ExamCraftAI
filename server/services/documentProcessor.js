const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text with page-level metadata from uploaded file
 */
async function processDocumentFile(filePath, mimeType, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    return await extractPdfContent(filePath);
  } else if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractDocxContent(filePath);
  } else if (ext === '.txt' || mimeType === 'text/plain') {
    return await extractTxtContent(filePath);
  } else {
    throw new Error(`Unsupported document file type: ${ext || mimeType}. Please upload a PDF, DOCX, or TXT file.`);
  }
}

/**
 * Extracts PDF text and preserves per-page information
 */
async function extractPdfContent(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  let pageIndex = 1;
  const pages = [];

  const options = {
    pagerender: function (pageData) {
      return pageData.getTextContent().then(function (textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pageIndex++,
          text: text.trim()
        });
        return text;
      });
    }
  };

  const parsed = await pdfParse(dataBuffer, options);
  const totalPages = parsed.numpages || pages.length || 1;
  const fullText = pages.map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');

  // Detect scanned document if text length is negligible
  const pureTextLength = pages.map(p => p.text).join('').replace(/\s+/g, '').length;
  const isScanned = pureTextLength < (totalPages * 20);

  return {
    pageCount: totalPages,
    fullText,
    pages,
    isScanned,
    status: isScanned ? 'ocr_required' : 'extracted'
  };
}

/**
 * Extracts DOCX text using Mammoth
 */
async function extractDocxContent(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const rawText = result.value || '';

  // Approximate page breaks for docx (every ~450 words)
  const paragraphs = rawText.split('\n\n').filter(p => p.trim().length > 0);
  const pages = [];
  let currentPageText = '';
  let currentPageNum = 1;

  for (const para of paragraphs) {
    currentPageText += para + '\n\n';
    if (currentPageText.split(/\s+/).length > 400) {
      pages.push({ pageNumber: currentPageNum++, text: currentPageText.trim() });
      currentPageText = '';
    }
  }
  if (currentPageText.trim().length > 0 || pages.length === 0) {
    pages.push({ pageNumber: currentPageNum, text: currentPageText.trim() });
  }

  return {
    pageCount: pages.length,
    fullText: rawText,
    pages,
    isScanned: false,
    status: 'extracted'
  };
}

/**
 * Extracts TXT content
 */
async function extractTxtContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    pageCount: 1,
    fullText: content,
    pages: [{ pageNumber: 1, text: content }],
    isScanned: false,
    status: 'extracted'
  };
}

/**
 * Splits document content into searchable, traceable chunks with page numbers and section headers
 */
function chunkDocumentText(pages, documentId, userId) {
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageNum = page.pageNumber;
    const lines = page.text.split('\n');

    let currentSection = `Page ${pageNum}`;
    let buffer = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect prominent unit/module/chapter/section headers
      const headerMatch = trimmed.match(/^(?:UNIT|MODULE|CHAPTER|SECTION|PART)\s+([0-9IVX]+[:\s\-\–].*)/i) ||
                          trimmed.match(/^(?:[0-9]+\.[0-9]+)\s+([A-Z\s\-]+)/);
      if (headerMatch) {
        if (buffer.trim().length > 50) {
          chunks.push({
            id: `chk-${documentId}-${chunkIndex++}`,
            documentId,
            userId,
            chunkIndex,
            pageNumber: pageNum,
            sectionTitle: currentSection,
            content: buffer.trim()
          });
          buffer = '';
        }
        currentSection = trimmed.slice(0, 80);
      }

      buffer += trimmed + ' ';

      // Split every ~600-800 characters or logical break
      if (buffer.length > 700) {
        chunks.push({
          id: `chk-${documentId}-${chunkIndex++}`,
          documentId,
          userId,
          chunkIndex,
          pageNumber: pageNum,
          sectionTitle: currentSection,
          content: buffer.trim()
        });
        buffer = '';
      }
    }

    if (buffer.trim().length > 0) {
      chunks.push({
        id: `chk-${documentId}-${chunkIndex++}`,
        documentId,
        userId,
        chunkIndex,
        pageNumber: pageNum,
        sectionTitle: currentSection,
        content: buffer.trim()
      });
    }
  }

  return chunks;
}

module.exports = {
  processDocumentFile,
  chunkDocumentText
};
