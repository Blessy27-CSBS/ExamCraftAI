const PDFDocument = require('pdfkit');

/**
 * Generates Student Question Paper PDF (Strictly NO answers/rubrics)
 * Features:
 * - Structured academic header and metadata grid
 * - Exact non-overlapping bounding boxes for questions and marks
 * - Pre-calculated page break thresholds to eliminate mid-element cuts
 * - Buffered two-pass page numbering ("Page X of Y")
 */
function generateStudentQuestionPaperPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

  const contentLeft = 40;
  const contentWidth = 515;
  const contentRight = contentLeft + contentWidth;

  // 1. Institutional Header
  const instName = (paper.institution_name || paper.instName || paper.institution || 'INSTITUTE OF TECHNOLOGY').trim();
  const deptName = (paper.department_name || paper.deptName || paper.department || 'Department of Computer Science & Engineering').trim();
  const courseCode = (paper.course_code || paper.courseCode || '').trim();

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a')
    .text(instName.toUpperCase(), { align: 'center', width: contentWidth });
  doc.fontSize(10).font('Helvetica').fillColor('#475569')
    .text(deptName, { align: 'center', width: contentWidth });
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a')
    .text((paper.title || paper.examType || 'Continuous Assessment Examination').toUpperCase(), { align: 'center', width: contentWidth });
  doc.moveDown(0.5);

  // Decorative Header Rule
  doc.strokeColor('#0f172a').lineWidth(1.2).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(contentLeft, doc.y + 2).lineTo(contentRight, doc.y + 2).stroke();
  doc.y += 6;

  // 2. Metadata Grid (Structured 2-Column Key/Value Layout with Dynamic Row Heights)
  const metaStartY = doc.y;
  const leftColWidth = 320;
  const rightColWidth = 190;
  const rightColX = contentLeft + leftColWidth + 5;

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b');
  const subjStr = `Subject: ${paper.subject || ''}${courseCode ? ` (${courseCode})` : ''}`;
  const marksStr = `Max Marks: ${paper.total_marks || paper.totalMarks || 50}`;
  const row1H = Math.max(doc.heightOfString(subjStr, { width: leftColWidth }), doc.heightOfString(marksStr, { width: rightColWidth }), 12);
  doc.text(subjStr, contentLeft, metaStartY, { width: leftColWidth });
  doc.text(marksStr, rightColX, metaStartY, { width: rightColWidth, align: 'right' });

  const metaRow2Y = metaStartY + row1H + 4;
  doc.font('Helvetica').fillColor('#334155');
  const acadStr = `Academic Year: ${paper.academic_year || paper.academicYear || '2025-2026'}`;
  const durStr = `Duration: ${paper.duration_minutes || paper.duration || 90} Minutes`;
  const row2H = Math.max(doc.heightOfString(acadStr, { width: leftColWidth }), doc.heightOfString(durStr, { width: rightColWidth }), 12);
  doc.text(acadStr, contentLeft, metaRow2Y, { width: leftColWidth });
  doc.text(durStr, rightColX, metaRow2Y, { width: rightColWidth, align: 'right' });

  const metaRow3Y = metaRow2Y + row2H + 4;
  const examDateStr = `Examination Date: ${paper.exam_date || paper.examDate || new Date().toISOString().split('T')[0]}`;
  const examTypeStr = `Exam Type: ${paper.exam_type || paper.examType || 'Formative Evaluation'}`;
  const row3H = Math.max(doc.heightOfString(examDateStr, { width: leftColWidth }), doc.heightOfString(examTypeStr, { width: rightColWidth }), 12);
  doc.text(examDateStr, contentLeft, metaRow3Y, { width: leftColWidth });
  doc.text(examTypeStr, rightColX, metaRow3Y, { width: rightColWidth, align: 'right' });

  doc.y = metaRow3Y + row3H + 6;
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
  doc.y += 8;

  // 3. General Candidate Instructions Box
  if (paper.instructions) {
    const instrStartY = doc.y;
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('General Instructions:', contentLeft, instrStartY);
    doc.fontSize(8).font('Helvetica').fillColor('#475569')
      .text(paper.instructions, contentLeft, doc.y + 2, { width: contentWidth, lineGap: 1.5 });
    doc.y += 6;
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
    doc.y += 8;
  }

  // 4. Questions List
  let currentGroup = '';
  const numColW = 28;
  const marksColW = 60;
  const marksX = contentRight - marksColW;
  const textX = contentLeft + numColW;
  const textW = contentWidth - numColW - marksColW - 10; // strictly bounded width

  questions.forEach((q, idx) => {
    const qNumber = q.question_number || q.number || (idx + 1);
    const qText = q.question_text || q.questionText || q.text || '';
    const qMarks = q.marks || 2;
    const groupName = q.group_name || q.groupName || '';

    // Print section header if group changes
    if (groupName && groupName !== currentGroup) {
      currentGroup = groupName;
      if (doc.y > 60 && doc.y > 700) doc.addPage();
      doc.y += 4;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f766e')
        .text(currentGroup.toUpperCase(), contentLeft, doc.y, { align: 'center', width: contentWidth });
      doc.strokeColor('#0f766e').lineWidth(0.5).moveTo(contentLeft + 150, doc.y + 2).lineTo(contentRight - 150, doc.y + 2).stroke();
      doc.y += 8;
    }

    // Parse options for MCQs
    let options = [];
    if (q.options) {
      options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    }

    // Pre-calculate heights with matching lineGap to ensure accurate spacing
    doc.fontSize(9).font('Helvetica');
    const textHeight = doc.heightOfString(qText, { width: textW, lineGap: 1.5 });
    let optionsHeight = 0;
    const parsedOptions = [];
    if (Array.isArray(options) && options.length > 0) {
      options.forEach(opt => {
        const optText = `(${opt.label || '•'}) ${opt.text || ''}`;
        const optH = doc.heightOfString(optText, { width: textW - 10, lineGap: 1 });
        parsedOptions.push({ text: optText, height: optH });
        optionsHeight += optH + 4;
      });
    }
    const totalQHeight = Math.max(textHeight, 14) + optionsHeight + 8;

    // Page Break Threshold (735 pt leaves ample buffer above footer at 795)
    if (doc.y > 60 && doc.y + totalQHeight > 735) {
      doc.addPage();
    }

    const startY = doc.y;

    // Col 1: Q Number
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a')
      .text(`Q${qNumber}.`, contentLeft, startY, { width: numColW });

    // Col 2: Question Text (Bounded width, never touches marks)
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
      .text(qText, textX, startY, { width: textW, lineGap: 1.5 });

    // Col 3: Marks (Pinned to right margin at identical startY)
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a')
      .text(`[${qMarks} Marks]`, marksX, startY, { width: marksColW, align: 'right' });

    // Options rendering below question text
    if (parsedOptions.length > 0) {
      let optY = startY + textHeight + 4;
      parsedOptions.forEach(opt => {
        doc.fontSize(8.5).font('Helvetica').fillColor('#334155')
          .text(opt.text, textX + 10, optY, { width: textW - 10, lineGap: 1 });
        optY += opt.height + 4;
      });
    }

    doc.y = startY + totalQHeight;
  });

  // End signature
  if (doc.y > 750) doc.addPage();
  doc.y += 10;
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(contentLeft + 120, doc.y).lineTo(contentRight - 120, doc.y).stroke();
  doc.y += 5;
  doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748b')
    .text('*** END OF QUESTION PAPER ***', contentLeft, doc.y, { align: 'center', width: contentWidth });

  // Two-pass page numbering
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
      .text(`Page ${i + 1} of ${pageRange.count}`, contentLeft, 790, { align: 'center', width: contentWidth, lineBreak: false });
    doc.page.margins.bottom = prevBottom;
  }

  return doc;
}

/**
 * Generates Faculty Answer Key & Marking Scheme PDF (Confidential)
 * Features:
 * - Dedicated confidential header with security watermark
 * - Clean structured cards for question, model answer, key concepts, and marking rubrics
 * - Bounded rubric tables with strict row height computation to eliminate overlap
 * - Multi-page safety with clean question-level page breaks
 */
function generateFacultyAnswerKeyPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

  const contentLeft = 40;
  const contentWidth = 515;
  const contentRight = contentLeft + contentWidth;

  // 1. Confidential Top Banner
  doc.rect(contentLeft, 25, contentWidth, 18).fill('#fef2f2');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#b91c1c')
    .text('CONFIDENTIAL — FACULTY EVALUATION SCHEME & MODEL ANSWERS', contentLeft, 30, { align: 'center', width: contentWidth });

  doc.y = 52;
  const instName = (paper.institution_name || paper.instName || paper.institution || 'INSTITUTE OF SCIENCE & TECHNOLOGY').trim();
  const courseCode = (paper.course_code || paper.courseCode || '').trim();

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a')
    .text(instName.toUpperCase(), { align: 'center', width: contentWidth });
  doc.fontSize(10).font('Helvetica').fillColor('#475569')
    .text(`${paper.subject || paper.title} — Faculty Evaluation Scheme`, { align: 'center', width: contentWidth });
  doc.moveDown(0.4);

  // Metadata Strip
  doc.strokeColor('#b91c1c').lineWidth(1.2).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
  doc.y += 6;

  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155');
  const codePart = courseCode ? ` | Course/Code: ${courseCode}` : '';
  doc.text(`Subject: ${paper.subject || ''}${codePart} | Max Marks: ${paper.total_marks || paper.totalMarks || 50}`, contentLeft, doc.y, { align: 'center', width: contentWidth });
  doc.y += 6;
  doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
  doc.y += 10;

  // Questions Review with Model Answers & Rubrics
  questions.forEach((q, idx) => {
    const qNumber = q.question_number || q.number || (idx + 1);
    const qText = q.question_text || q.questionText || q.text || '';
    const qMarks = q.marks || 2;
    const modelAns = q.model_answer || q.modelAnswer || 'Refer to syllabus core reading.';
    const keyConcepts = q.key_concepts || q.keyConcepts || '';
    const expectedPoints = q.expected_points || q.expectedPoints || '';
    let rubric = q.rubric || [];
    if (typeof rubric === 'string') {
      try { rubric = JSON.parse(rubric); } catch (e) { rubric = []; }
    }

    // Estimate block size
    doc.fontSize(9).font('Helvetica');
    const qTextH = doc.heightOfString(qText, { width: contentWidth - 16 });
    const ansH = doc.heightOfString(modelAns, { width: contentWidth - 24 });
    const rubricH = Array.isArray(rubric) && rubric.length > 0 ? (rubric.length * 16 + 22) : 0;
    const estimatedBlockH = qTextH + ansH + rubricH + 60;

    // If block won't fit on current page and we are already partway down, start on fresh page
    if (doc.y > 450 && (doc.y + estimatedBlockH > 740)) {
      doc.addPage();
    }

    // Question Bar
    const qBarY = doc.y;
    doc.rect(contentLeft, qBarY, contentWidth, 18).fill('#f0fdfa');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f766e')
      .text(`Q${qNumber}. [${qMarks} Marks] (${q.unit || 'Unit 1'} • Bloom: ${q.bloom_level || q.bloomLevel || 'Understand'})`, contentLeft + 8, qBarY + 5, { width: contentWidth - 16 });

    doc.y = qBarY + 22;

    // Question text
    doc.fontSize(9).font('Helvetica').fillColor('#0f172a')
      .text(qText, contentLeft + 8, doc.y, { width: contentWidth - 16, lineGap: 1.5 });
    doc.y += 6;

    // Model Answer Box
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0369a1').text('Model Answer / Solution Outline:', contentLeft + 8, doc.y);
    doc.fontSize(8.5).font('Helvetica').fillColor('#1e293b')
      .text(modelAns, contentLeft + 14, doc.y + 2, { width: contentWidth - 24, lineGap: 1.5 });
    doc.y += 6;

    // Key Concepts
    if (keyConcepts) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Key Technical Concepts: ', contentLeft + 8, doc.y, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(keyConcepts, { continued: false });
      doc.y += 4;
    }

    // Expected Points
    if (expectedPoints) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Expected Student Points: ', contentLeft + 8, doc.y, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(expectedPoints, { continued: false });
      doc.y += 4;
    }

    // Criterion-Wise Marking Scheme Breakdown
    if (Array.isArray(rubric) && rubric.length > 0) {
      doc.y += 4;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#065f46')
        .text('Marking Scheme & Rubric Split:', contentLeft + 8, doc.y);
      doc.y += 3;

      // Table Header
      const tblHeaderY = doc.y;
      doc.rect(contentLeft + 8, tblHeaderY, contentWidth - 16, 14).fill('#ecfdf5');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#065f46')
        .text('Evaluation Criterion / Step Description', contentLeft + 14, tblHeaderY + 3, { width: 380 });
      doc.text('Marks', contentRight - 70, tblHeaderY + 3, { width: 55, align: 'right' });
      doc.y = tblHeaderY + 16;

      let rubricSum = 0;
      rubric.forEach(r => {
        const critDesc = r.criterion || r.criterion_description || 'Detailed technical explanation';
        const rMarks = parseFloat(r.marks || r.marks_allocated || 1);
        rubricSum += rMarks;

        doc.fontSize(8).font('Helvetica');
        const descH = doc.heightOfString(critDesc, { width: 380 });
        const rowH = Math.max(descH, 12) + 4;

        if (doc.y > 60 && doc.y + rowH > 750) doc.addPage();

        const rowY = doc.y;
        doc.fillColor('#1e293b').text(critDesc, contentLeft + 14, rowY, { width: 380 });
        doc.font('Helvetica-Bold').fillColor('#065f46').text(`${rMarks} M`, contentRight - 70, rowY, { width: 55, align: 'right' });

        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(contentLeft + 8, rowY + rowH - 1).lineTo(contentRight - 8, rowY + rowH - 1).stroke();
        doc.y = rowY + rowH;
      });

      // Total Line
      doc.strokeColor('#065f46').lineWidth(0.8).moveTo(contentLeft + 8, doc.y).lineTo(contentRight - 8, doc.y).stroke();
      doc.y += 3;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#065f46')
        .text('TOTAL MARKS', contentLeft + 14, doc.y, { width: 380 });
      doc.text(`${rubricSum} Marks`, contentRight - 70, doc.y, { width: 55, align: 'right' });
      doc.y += 8;
    }

    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(contentLeft, doc.y).lineTo(contentRight, doc.y).stroke();
    if (idx < questions.length - 1) {
      doc.y += 8;
    }
  });

  // End signature
  if (doc.y > 750) doc.addPage();
  doc.y += 8;
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(contentLeft + 120, doc.y).lineTo(contentRight - 120, doc.y).stroke();
  doc.y += 5;
  doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748b')
    .text('*** END OF FACULTY EVALUATION SCHEME ***', contentLeft, doc.y, { align: 'center', width: contentWidth });

  // Two-pass page numbering
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
      .text(`Page ${i + 1} of ${pageRange.count}`, contentLeft, 790, { align: 'center', width: contentWidth, lineBreak: false });
    doc.page.margins.bottom = prevBottom;
  }

  return doc;
}

/**
 * Generates Curriculum Traceability & Grounding Audit Dossier PDF (Landscape)
 * Features:
 * - Strict multi-column landscape matrix
 * - Dynamic row-height measurement across all 7 columns (eliminating text overlap)
 * - Automatic repeat table headers on page break
 * - Certified accreditation format
 */
function generateTraceabilityAuditPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape', bufferPages: true });

  const contentLeft = 36;
  const contentWidth = 769; // 841.89 - 72
  const contentRight = contentLeft + contentWidth;

  // Header Function
  function renderAuditHeader() {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a')
      .text('CURRICULUM TRACEABILITY & COMPLIANCE AUDIT DOSSIER', contentLeft, 30, { align: 'center', width: contentWidth });
    doc.fontSize(9).font('Helvetica').fillColor('#475569')
      .text(`Assessment: ${paper.title || paper.subject} | Course Code: ${paper.course_code || paper.courseCode || 'CS101'} | Regulation: 2024`, contentLeft, 45, { align: 'center', width: contentWidth });

    doc.strokeColor('#0284c7').lineWidth(1.2).moveTo(contentLeft, 60).lineTo(contentRight, 60).stroke();

    // Table Column Headers
    const yHeader = 66;
    doc.rect(contentLeft, yHeader, contentWidth, 18).fill('#f0f9ff');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0369a1');

    doc.text('Q#', contentLeft + 4, yHeader + 5, { width: 28 });
    doc.text('Syllabus Unit', contentLeft + 36, yHeader + 5, { width: 85 });
    doc.text('Bloom Level', contentLeft + 125, yHeader + 5, { width: 75 });
    doc.text('Source Document', contentLeft + 204, yHeader + 5, { width: 120 });
    doc.text('Section / Page', contentLeft + 328, yHeader + 5, { width: 85 });
    doc.text('Traceable Syllabus Excerpt', contentLeft + 417, yHeader + 5, { width: 250 });
    doc.text('Grounding Status', contentLeft + 671, yHeader + 5, { width: 94, align: 'right' });

    doc.strokeColor('#bae6fd').lineWidth(0.5).moveTo(contentLeft, yHeader + 18).lineTo(contentRight, yHeader + 18).stroke();
    doc.y = yHeader + 22;
  }

  renderAuditHeader();

  // Column X Coordinates & Widths
  const colX = {
    qNum: contentLeft + 4,
    unit: contentLeft + 36,
    bloom: contentLeft + 125,
    doc: contentLeft + 204,
    sec: contentLeft + 328,
    excerpt: contentLeft + 417,
    status: contentLeft + 671
  };
  const colW = {
    qNum: 28,
    unit: 85,
    bloom: 75,
    doc: 120,
    sec: 85,
    excerpt: 250,
    status: 94
  };

  questions.forEach((q, idx) => {
    const qNum = `Q${q.question_number || q.number || (idx + 1)}`;
    const unit = q.unit || 'Unit 1';
    const bloom = q.bloom_level || q.bloomLevel || 'Understand';
    const sourceDoc = q.source_doc_name || q.sourceDocName || 'Course_Syllabus.pdf';
    const secPage = `${q.source_page || q.sourcePage || 'P.1'} • ${q.source_section || q.sourceSection || 'Sec 1'}`;
    const excerpt = q.source_excerpt || q.sourceExcerpt || 'Directly aligned to course module specifications and learning outcomes.';
    const status = q.evidence_status || q.evidenceStatus || 'Supported by source';

    // Measure cell heights
    doc.fontSize(8).font('Helvetica');
    const hUnit = doc.heightOfString(unit, { width: colW.unit });
    const hDoc = doc.heightOfString(sourceDoc, { width: colW.doc });
    const hSec = doc.heightOfString(secPage, { width: colW.sec });
    const hExcerpt = doc.heightOfString(excerpt, { width: colW.excerpt, lineGap: 1 });

    const rowH = Math.max(hUnit, hDoc, hSec, hExcerpt, 14) + 8;

    // Check page break
    if (doc.y > 60 && doc.y + rowH > 540) {
      doc.addPage({ layout: 'landscape' });
      renderAuditHeader();
    }

    const rowY = doc.y;

    // Alternate row shading
    if (idx % 2 === 1) {
      doc.rect(contentLeft, rowY - 2, contentWidth, rowH).fill('#f8fafc');
    }

    // Render each cell at identical rowY
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text(qNum, colX.qNum, rowY, { width: colW.qNum });
    doc.font('Helvetica').fillColor('#334155').text(unit, colX.unit, rowY, { width: colW.unit });
    doc.fillColor('#0369a1').text(bloom, colX.bloom, rowY, { width: colW.bloom });
    doc.fillColor('#334155').text(sourceDoc, colX.doc, rowY, { width: colW.doc });
    doc.fillColor('#64748b').text(secPage, colX.sec, rowY, { width: colW.sec });
    doc.fillColor('#1e293b').text(excerpt, colX.excerpt, rowY, { width: colW.excerpt, lineGap: 1 });
    doc.font('Helvetica-Bold').fillColor('#059669').text(status, colX.status, rowY, { width: colW.status, align: 'right' });

    // Underline
    doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(contentLeft, rowY + rowH - 2).lineTo(contentRight, rowY + rowH - 2).stroke();
    doc.y = rowY + rowH;
  });

  // Two-pass page numbering
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
      .text(`Page ${i + 1} of ${pageRange.count}`, contentLeft, 550, { align: 'center', width: contentWidth, lineBreak: false });
    doc.page.margins.bottom = prevBottom;
  }

  return doc;
}

module.exports = {
  generateStudentQuestionPaperPdf,
  generateFacultyAnswerKeyPdf,
  generateTraceabilityAuditPdf
};
