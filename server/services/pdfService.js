const PDFDocument = require('pdfkit');

/**
 * Generates Student Question Paper PDF (Strictly NO answers/rubrics)
 */
function generateStudentQuestionPaperPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Institutional Header
  doc.fontSize(14).font('Helvetica-Bold').text(paper.institution_name || 'INSTITUTE OF SCIENCE & TECHNOLOGY', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text(paper.department_name || 'Department of Computer Science & Engineering', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(12).font('Helvetica-Bold').text(paper.title || 'Continuous Assessment Examination', { align: 'center' });
  doc.moveDown(0.6);

  // Meta Table Line
  doc.fontSize(9).font('Helvetica-Bold');
  const yMeta = doc.y;
  doc.text(`Subject: ${paper.subject || ''} (${paper.course_code || ''})`, 40, yMeta);
  doc.text(`Date: ${paper.exam_date || 'TBD'}`, 340, yMeta);
  doc.moveDown(0.4);

  const yMeta2 = doc.y;
  doc.text(`Academic Year: ${paper.academic_year || '2025-2026'}`, 40, yMeta2);
  doc.text(`Duration: ${paper.duration_minutes || 90} Minutes`, 250, yMeta2);
  doc.text(`Max Marks: ${paper.total_marks || 50}`, 450, yMeta2);
  doc.moveDown(0.8);

  // Divider
  doc.strokeColor('#333333').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.6);

  // General Instructions
  if (paper.instructions) {
    doc.fontSize(9).font('Helvetica-Bold').text('General Instructions:');
    doc.fontSize(8.5).font('Helvetica').text(paper.instructions);
    doc.moveDown(0.8);
    doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);
  }

  // Questions
  doc.fontSize(10).font('Helvetica-Bold').text('QUESTIONS', { underline: true });
  doc.moveDown(0.5);

  questions.forEach((q, idx) => {
    // Check if near bottom of page
    if (doc.y > 700) {
      doc.addPage();
    }

    doc.fontSize(9.5).font('Helvetica-Bold').text(`Q${idx + 1}. `, 40, doc.y, { continued: true });
    doc.font('Helvetica').text(`${q.question_text || q.questionText}`, { continued: false });
    
    // Marks on right
    doc.fontSize(9).font('Helvetica-Bold').text(`[${q.marks} Marks]`, 490, doc.y - 12, { align: 'right' });
    doc.moveDown(0.3);

    // MCQs Options
    const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    if (Array.isArray(options) && options.length > 0) {
      options.forEach(opt => {
        doc.fontSize(9).font('Helvetica').text(`    (${opt.label}) ${opt.text}`);
      });
      doc.moveDown(0.3);
    }

    doc.moveDown(0.6);
  });

  // Footer Signature
  doc.moveDown(1.5);
  if (doc.y > 720) doc.addPage();
  doc.fontSize(8.5).font('Helvetica-Oblique').text('*** END OF QUESTION PAPER ***', { align: 'center' });

  return doc;
}

/**
 * Generates Faculty Answer Key & Marking Scheme PDF (Confidential)
 */
function generateFacultyAnswerKeyPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header
  doc.fillColor('#b91c1c').fontSize(10).font('Helvetica-Bold').text('CONFIDENTIAL — FACULTY MARKING GUIDE & RUBRIC', { align: 'center' });
  doc.fillColor('#000000').moveDown(0.3);
  doc.fontSize(13).font('Helvetica-Bold').text(paper.institution_name || 'INSTITUTE OF SCIENCE & TECHNOLOGY', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text(`${paper.title} — Model Answers`, { align: 'center' });
  doc.moveDown(0.6);

  doc.strokeColor('#b91c1c').lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);

  questions.forEach((q, idx) => {
    if (doc.y > 660) doc.addPage();

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0369a1')
      .text(`Q${idx + 1}. [${q.marks} Marks] (${q.unit || 'Unit 1'} • Bloom: ${q.bloom_level || q.bloomLevel || 'Understand'})`);
    doc.fillColor('#000000').fontSize(9).font('Helvetica').text(q.question_text || q.questionText);
    doc.moveDown(0.4);

    // Model Answer
    doc.fontSize(8.5).font('Helvetica-Bold').text('Model Answer:');
    doc.font('Helvetica').text(q.model_answer || q.modelAnswer || 'Refer to syllabus textbook.');
    doc.moveDown(0.3);

    // Expected Points
    if (q.expected_points || q.expectedPoints) {
      doc.fontSize(8.5).font('Helvetica-Bold').text('Expected Key Points:');
      doc.font('Helvetica').text(q.expected_points || q.expectedPoints);
      doc.moveDown(0.3);
    }

    // Rubric Table
    const rubric = typeof q.rubric === 'string' ? JSON.parse(q.rubric) : (q.rubric || []);
    if (Array.isArray(rubric) && rubric.length > 0) {
      doc.fontSize(8.5).font('Helvetica-Bold').text('Marking Scheme Breakdown:');
      rubric.forEach((r, rIdx) => {
        doc.font('Helvetica').text(`  • ${r.criterion || r.criterion_description}: ${r.marks || r.marks_allocated} Marks`);
      });
      doc.moveDown(0.3);
    }

    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);
  });

  return doc;
}

/**
 * Generates Curriculum Traceability Audit Matrix PDF
 */
function generateTraceabilityAuditPdf(paper, questions) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

  doc.fontSize(14).font('Helvetica-Bold').text('CURRICULUM TRACEABILITY & COMPLIANCE AUDIT DOSSIER', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Assessment: ${paper.title} | Course: ${paper.subject} (${paper.course_code})`, { align: 'center' });
  doc.moveDown(0.8);

  doc.strokeColor('#0284c7').lineWidth(1.5).moveTo(40, doc.y).lineTo(800, doc.y).stroke();
  doc.moveDown(0.6);

  // Table Headers
  const yHeader = doc.y;
  doc.fontSize(8.5).font('Helvetica-Bold');
  doc.text('Q#', 40, yHeader);
  doc.text('Unit', 65, yHeader);
  doc.text('Bloom Level', 140, yHeader);
  doc.text('Source Document', 230, yHeader);
  doc.text('Page/Section', 360, yHeader);
  doc.text('Traceable Syllabus Excerpt', 460, yHeader);
  doc.text('Status', 720, yHeader);

  doc.moveDown(0.4);
  doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(40, doc.y).lineTo(800, doc.y).stroke();
  doc.moveDown(0.5);

  questions.forEach((q, idx) => {
    if (doc.y > 510) {
      doc.addPage({ layout: 'landscape' });
    }

    const yRow = doc.y;
    doc.fontSize(8).font('Helvetica-Bold').text(`Q${idx + 1}`, 40, yRow);
    doc.font('Helvetica').text(q.unit || 'Unit 1', 65, yRow, { width: 70 });
    doc.text(q.bloom_level || q.bloomLevel || 'Apply', 140, yRow, { width: 85 });
    doc.text(q.source_doc_name || q.sourceDocName || 'Syllabus.pdf', 230, yRow, { width: 120 });
    doc.text(`${q.source_page || q.sourcePage || 'Page 1'} / ${q.source_section || q.sourceSection || 'Sec 1'}`, 360, yRow, { width: 95 });
    
    const excerpt = (q.source_excerpt || q.sourceExcerpt || 'Directly aligned to course module specifications.').slice(0, 110);
    doc.text(excerpt, 460, yRow, { width: 250 });

    const status = q.evidence_status || q.evidenceStatus || 'Supported by source';
    doc.font('Helvetica-Bold').text(status, 720, yRow, { width: 80 });

    doc.moveDown(0.8);
    doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(40, doc.y).lineTo(800, doc.y).stroke();
    doc.moveDown(0.4);
  });

  return doc;
}

module.exports = {
  generateStudentQuestionPaperPdf,
  generateFacultyAnswerKeyPdf,
  generateTraceabilityAuditPdf
};
