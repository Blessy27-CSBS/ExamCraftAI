const assert = require('assert');

async function testLiveApi() {
  const BASE = 'http://127.0.0.1:8080/api';
  console.log('Testing live API at:', BASE);

  // 1. Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@examcraft.ai', password: 'Faculty@2026' })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true, 'Login must succeed');
  assert.ok(loginData.token, 'Must return JWT token');
  console.log('✅ 1. Login succeeded with JWT token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginData.token}`
  };

  // 2. Dashboard metrics
  const metricRes = await fetch(`${BASE}/dashboard/metrics`, { headers });
  const metricData = await metricRes.json();
  assert.strictEqual(metricData.success, true);
  console.log('✅ 2. Dashboard metrics retrieved:', metricData.metrics);

  // 3. Save Blueprint
  const bpRes = await fetch(`${BASE}/blueprints`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subject: 'Operating Systems & Concurrency',
      courseCode: 'CS302',
      totalMarks: 50,
      duration: 90,
      examType: 'Model Examination',
      diffEasy: 30, diffMed: 50, diffHard: 20,
      unitsCovered: ['Unit 1: Process Concurrency', 'Unit 2: Memory Management'],
      groups: [
        { name: 'Part A (Short Answer)', count: 5, marksPerQ: 2, type: 'Theory', difficulty: 'Easy' },
        { name: 'Part B (Analytical)', count: 5, marksPerQ: 8, type: 'Scenario-Based', difficulty: 'Medium' }
      ]
    })
  });
  const bpData = await bpRes.json();
  assert.strictEqual(bpData.success, true, 'Blueprint must save');
  console.log('✅ 3. Assessment blueprint created:', bpData.blueprintId);

  const osSyllabusText = `UNIT 1: Process Concurrency and Synchronization. Race conditions, critical sections, mutual exclusion, semaphores, mutex locks, and monitors. Classic synchronization problems including bounded buffer and dining philosophers.
UNIT 2: Memory Management and Virtual Memory. Paging, segmentation, address translation, page replacement algorithms including FIFO, LRU, and Optimal replacement. Thrashing and working set model.`;

  // 4. Request Assessment Plan
  const planRes = await fetch(`${BASE}/papers/plan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      blueprint: {
        subject: 'Operating Systems & Concurrency',
        courseCode: 'CS302',
        totalMarks: 50,
        duration: 90,
        examType: 'Model Examination',
        uploadedSyllabus: { text: osSyllabusText, fileName: 'OS_Syllabus.txt' },
        unitsCovered: ['Unit 1: Process Concurrency', 'Unit 2: Memory Management'],
        groups: [
          { name: 'Part A', count: 5, marksPerQ: 2, type: 'Theory', difficulty: 'Easy' },
          { name: 'Part B', count: 5, marksPerQ: 8, type: 'Scenario-Based', difficulty: 'Medium' }
        ]
      }
    })
  });
  const planData = await planRes.json();
  assert.strictEqual(planData.success, true);
  assert.strictEqual(planData.plan.length, 10, 'Plan must contain 10 slots');
  console.log('✅ 4. Assessment slot-by-slot generation plan constructed (10 distinct slots)');

  // 5. Generate Assessment Draft
  console.log('   Generating assessment paper draft...');
  const genRes = await fetch(`${BASE}/papers/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      blueprint: {
        subject: 'Operating Systems & Concurrency',
        courseCode: 'CS302',
        totalMarks: 50,
        duration: 90,
        examType: 'Model Examination',
        uploadedSyllabus: { text: osSyllabusText, fileName: 'OS_Syllabus.txt' },
        unitsCovered: ['Unit 1: Process Concurrency', 'Unit 2: Memory Management'],
        groups: [
          { name: 'Part A', count: 5, marksPerQ: 2, type: 'Theory', difficulty: 'Easy' },
          { name: 'Part B', count: 5, marksPerQ: 8, type: 'Scenario-Based', difficulty: 'Medium' }
        ]
      },
      customPlan: { slots: planData.plan }
    })
  });
  const genData = await genRes.json();
  assert.strictEqual(genData.success, true, 'Generation must succeed');
  const paperId = genData.paperId;
  console.log(`✅ 5. Paper generated via ${genData.engine}:`, paperId);

  // 6. Fetch Full Paper
  const paperRes = await fetch(`${BASE}/papers/${paperId}`, { headers });
  const paperData = await paperRes.json();
  assert.strictEqual(paperData.success, true);
  const paper = paperData.paper;
  assert.strictEqual(paper.questions.length, 10, 'Must have 10 generated questions');
  console.log(`✅ 6. Verified 10 generated questions with model answers & rubrics`);

  // 7. Approve Paper
  const approveRes = await fetch(`${BASE}/papers/${paperId}/approve`, {
    method: 'POST',
    headers
  });
  const approveData = await approveRes.json();
  assert.strictEqual(approveData.success, true);
  console.log('✅ 7. Paper approved by faculty:', approveData.approvedBy);

  // 8. Verify Student PDF Export
  const studentPdfRes = await fetch(`${BASE}/exports/${paperId}/student-pdf`, { headers });
  assert.strictEqual(studentPdfRes.status, 200);
  assert.strictEqual(studentPdfRes.headers.get('content-type'), 'application/pdf');
  const pdfBuffer = await studentPdfRes.arrayBuffer();
  assert.ok(pdfBuffer.byteLength > 1000);
  console.log(`✅ 8. Student Question Paper PDF streamed (${pdfBuffer.byteLength} bytes)`);

  // 9. Verify Faculty Answer Key PDF Export
  const facultyPdfRes = await fetch(`${BASE}/exports/${paperId}/faculty-pdf`, { headers });
  assert.strictEqual(facultyPdfRes.status, 200);
  assert.strictEqual(facultyPdfRes.headers.get('content-type'), 'application/pdf');
  const keyBuffer = await facultyPdfRes.arrayBuffer();
  assert.ok(keyBuffer.byteLength > 1000);
  console.log(`✅ 9. Faculty Answer Key PDF streamed (${keyBuffer.byteLength} bytes)`);

  console.log('\n🎉 ALL LIVE END-TO-END WORKFLOWS COMPLETED SUCCESSFULLY!');
}

testLiveApi().catch(err => {
  console.error('Live API test failed:', err);
  process.exit(1);
});
