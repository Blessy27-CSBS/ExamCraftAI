/**
 * Automated Known-Document Grounding & Verification Test Suite
 * Tests syllabus extraction, slot-based blueprint mapping, RAG passage retrieval,
 * duplicate rejection, mark validation, rubric balance, and strict grounding.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Import services directly to test isolated engine behavior
const { initDatabase } = require('../server/db/database');
const { extractSyllabusStructure } = require('../server/services/documentProcessor');
const { constructAssessmentPlan, generateAssessmentQuestions, balanceRubricMarks } = require('../server/services/aiGenerator');
const { calculateJaccardSimilarity, calculateNGramSimilarity, checkQuestionSimilarity } = require('../server/services/retrieval');

async function runKnownDocumentTests() {
  console.log('🧪 Starting Known-Document Assessment Grounding Test Suite...\n');
  await initDatabase();

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  async function testAsync(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Load Fixture
  const fixturePath = path.resolve(__dirname, 'fixtures/sample_test_syllabus.txt');
  const syllabusText = fs.readFileSync(fixturePath, 'utf8');

  test('Test Fixture loads with 3 distinct units', () => {
    assert(syllabusText.includes('UNIT 1: Distributed Consensus'), 'Must contain Unit 1');
    assert(syllabusText.includes('UNIT 2: Database Storage Engines'), 'Must contain Unit 2');
    assert(syllabusText.includes('UNIT 3: Microservices Resiliency'), 'Must contain Unit 3');
  });

  // 2. Syllabus Structure Extraction
  const structure = extractSyllabusStructure(syllabusText, [], 'sample_test_syllabus.txt');

  test('Course title and code accurately extracted from text', () => {
    assert.strictEqual(structure.subject, 'ADVANCED DISTRIBUTED SYSTEMS', 'Subject name mismatch');
    assert.strictEqual(structure.courseCode, 'CS601', 'Course code mismatch');
  });

  test('All 3 units identified with valid topics', () => {
    assert.strictEqual(structure.units.length, 3, 'Must have exactly 3 units');
    assert(structure.units[0].title.includes('Distributed Consensus'), 'Unit 1 title mismatch');
    assert(structure.units[1].title.includes('Database Storage Engines'), 'Unit 2 title mismatch');
    assert(structure.units[2].title.includes('Microservices Resiliency'), 'Unit 3 title mismatch');
    
    // Check topics
    assert(structure.units[0].topics.length >= 2, 'Unit 1 topics missing');
    assert(structure.units[1].topics.length >= 2, 'Unit 2 topics missing');
    assert(structure.units[2].topics.length >= 2, 'Unit 3 topics missing');
  });

  // 3. Duplicate Detection Engine
  test('Duplicate detection catches identical questions', () => {
    const q1 = { questionText: 'Explain the leader election process in the Raft consensus algorithm.', keyConcepts: 'Raft, Leader Election' };
    const q2 = { questionText: 'Explain the leader election process in the Raft consensus algorithm.', keyConcepts: 'Raft, Leader Election' };
    const check = checkQuestionSimilarity(q2, [q1]);
    assert.strictEqual(check.isDuplicate, true, 'Identical questions must be flagged as duplicates');
    assert.strictEqual(check.maxSimilarity, 1.0, 'Identical questions must have similarity of 1.0');
  });

  test('Duplicate detection catches near-duplicate paraphrases', () => {
    const q1 = { questionText: 'What is the function of the Write-Ahead Log in LSM tree storage engines?', keyConcepts: 'WAL, LSM tree' };
    const q2 = { questionText: 'What is the role and function of Write-Ahead Logs (WAL) in LSM-tree engines?', keyConcepts: 'WAL, LSM tree' };
    const check = checkQuestionSimilarity(q2, [q1]);
    assert.strictEqual(check.isDuplicate, true, 'Near-duplicate paraphrases must be flagged as duplicates');
    assert(check.maxSimilarity >= 0.52, `Expected near-duplicate similarity >= 0.52, got ${check.maxSimilarity}`);
  });

  test('Distinct questions for different concepts are accepted without duplicate rejection', () => {
    const q1 = { questionText: 'Explain the three state transitions of an automated circuit breaker under peak cascade failure.', keyConcepts: 'Circuit breaker, Cascade failure' };
    const q2 = { questionText: 'Derive the quorum calculation formula for Raft leader elections with N nodes.', keyConcepts: 'Quorum calculation, Raft' };
    const check = checkQuestionSimilarity(q2, [q1]);
    assert.strictEqual(check.isDuplicate, false, 'Distinct questions must not be flagged as duplicates');
    assert(check.maxSimilarity < 0.40, `Distinct questions should have low similarity, got ${check.maxSimilarity}`);
  });

  // 4. Rubric Balancing Logic
  test('Rubric balance function accurately adjusts criteria to sum up to question marks', () => {
    const rawRubric = [
      { criterion: 'Theoretical explanation', marks: 3 },
      { criterion: 'State transition diagram', marks: 3 }
    ];
    const balanced = balanceRubricMarks(rawRubric, 8);
    const sum = balanced.reduce((acc, r) => acc + r.marks, 0);
    assert.strictEqual(sum, 8, `Rubric sum must equal 8, got ${sum}`);
  });

  // 5. Blueprint Assessment Plan Construction
  test('Assessment plan constructs valid slots across units with balanced coverage', () => {
    const blueprint = {
      subject: 'Advanced Distributed Systems',
      courseCode: 'CS601',
      totalMarks: 30,
      groups: [
        { name: 'Part A', count: 3, marksPerQ: 2, type: 'Theory', difficulty: 'Easy' },
        { name: 'Part B', count: 2, marksPerQ: 8, type: 'Scenario-Based', difficulty: 'Medium' },
        { name: 'Part C', count: 1, marksPerQ: 8, type: 'Numerical/Problem-Solving', difficulty: 'Hard' }
      ]
    };
    const plan = constructAssessmentPlan(blueprint, structure);
    assert(plan.slots && plan.slots.length === 6, `Expected 6 slots in plan, got ${plan.slots?.length}`);
    assert.strictEqual(plan.totalPlannedMarks, 30, `Total planned marks must equal 30, got ${plan.totalPlannedMarks}`);

    // Verify slots are assigned to units from structure
    const assignedUnits = new Set(plan.slots.map(s => s.unit));
    assert(assignedUnits.size >= 2, 'Slots should be distributed across multiple units');
  });

  // 6. Blueprint Execution & Question Generation
  await testAsync('Generate balanced assessment matching exact blueprint counts, marks, and syllabus grounding', async () => {
    const blueprint = {
      subject: 'Advanced Distributed Systems',
      courseCode: 'CS601',
      examType: 'Model Examination',
      totalMarks: 30,
      duration: 60,
      uploadedSyllabus: { text: syllabusText },
      verifiedStructure: structure,
      groups: [
        {
          id: 'grp-part-a',
          name: 'Part A — Short Conceptual Questions',
          type: 'Theory',
          count: 3,
          marksPerQ: 2,
          difficulty: 'Easy'
        },
        {
          id: 'grp-part-b',
          name: 'Part B — Analytical Architecture Problems',
          type: 'Scenario-Based',
          count: 2,
          marksPerQ: 8,
          difficulty: 'Medium'
        },
        {
          id: 'grp-part-c',
          name: 'Part C — Quantitative Engine Formulation',
          type: 'Numerical/Problem-Solving',
          count: 1,
          marksPerQ: 8,
          difficulty: 'Hard'
        }
      ]
    };

    const mockSourceDoc = {
      id: 'doc-fixture-test',
      extracted_text: syllabusText
    };

    const result = await generateAssessmentQuestions(blueprint, mockSourceDoc, 'test-user-001', null);

    assert(result && result.questions, 'Result must contain questions');
    assert.strictEqual(result.questions.length, 6, `Expected 6 questions, got ${result.questions.length}`);

    // Verify marks distribution
    const totalCalculatedMarks = result.questions.reduce((sum, q) => sum + q.marks, 0);
    assert.strictEqual(totalCalculatedMarks, 30, `Total marks must equal 30, got ${totalCalculatedMarks}`);

    // Verify each question
    const generatedTexts = [];
    result.questions.forEach((q, idx) => {
      // 1. Text validity
      assert(q.questionText && q.questionText.length > 20, `Question ${idx + 1} text is too short`);
      
      // 2. Uniqueness check
      for (const prev of generatedTexts) {
        const check = checkQuestionSimilarity(q, [{ questionText: prev }]);
        assert(!check.isDuplicate, `Question ${idx + 1} is flagged as duplicate of previous question`);
      }
      generatedTexts.push(q.questionText);

      // 3. Mark matching
      if (idx < 3) {
        assert.strictEqual(q.marks, 2, `Question ${idx + 1} must be 2 marks`);
        assert.strictEqual(q.questionType, 'Theory', `Question ${idx + 1} must be Theory`);
      } else if (idx < 5) {
        assert.strictEqual(q.marks, 8, `Question ${idx + 1} must be 8 marks`);
        assert.strictEqual(q.questionType, 'Scenario-Based', `Question ${idx + 1} must be Scenario-Based`);
      } else {
        assert.strictEqual(q.marks, 8, `Question 6 must be 8 marks`);
        assert.strictEqual(q.questionType, 'Numerical/Problem-Solving', `Question 6 must be Numerical`);
      }

      // 4. Source Citation Grounding
      const citation = q.sourceCitation || q.sourceExcerpt || '';
      assert(citation.length > 5, `Question ${idx + 1} must contain source citation/excerpt`);
      const topicName = q.targetTopic || q.topic || '';
      assert(syllabusText.includes(citation.trim().slice(0, 30)) || 
             syllabusText.toLowerCase().includes(topicName.toLowerCase()) || 
             syllabusText.toLowerCase().includes(q.unit.toLowerCase()),
             `Question ${idx + 1} citation not found in syllabus`);

      // 5. Model Answer & Marking Rubric
      assert(q.modelAnswer && q.modelAnswer.length > 20, `Question ${idx + 1} must have a model answer`);
      if (q.rubric && q.rubric.length > 0) {
        const rubricSum = q.rubric.reduce((acc, r) => acc + (r.marks || 0), 0);
        assert.strictEqual(rubricSum, q.marks, `Rubric sum (${rubricSum}) must equal question marks (${q.marks})`);
      }
    });

    console.log(`\n    Verified all 6 generated questions:`);
    result.questions.forEach(q => {
      console.log(`    - Q${q.questionNumber} [${q.unit} | ${q.marks}M | ${q.questionType}]: ${q.questionText.slice(0, 65)}...`);
    });
  });

  // 7. Test With Real Indian University Syllabus: 24UCBP10 DIGITAL MARKETING STRATEGIES
  const dmFixturePath = path.resolve(__dirname, 'fixtures/digital_marketing_syllabus.txt');
  const dmSyllabusText = fs.readFileSync(dmFixturePath, 'utf8');

  test('Digital Marketing: Course code and subject title cleanly extracted', () => {
    const dmStruct = extractSyllabusStructure(dmSyllabusText, [], '24UCBP10_DIGITAL_MARKETING.pdf');
    assert.strictEqual(dmStruct.courseCode, '24UCBP10', `Expected course code 24UCBP10, got: ${dmStruct.courseCode}`);
    assert.strictEqual(dmStruct.subject, 'DIGITAL MARKETING STRATEGIES', `Expected subject DIGITAL MARKETING STRATEGIES, got: ${dmStruct.subject}`);
    assert.strictEqual(dmStruct.units.length, 5, `Expected 5 units, got: ${dmStruct.units.length}`);
  });

  test('Digital Marketing: All 5 units have clean titles and specific syllabus topics', () => {
    const dmStruct = extractSyllabusStructure(dmSyllabusText, [], '24UCBP10_DIGITAL_MARKETING.pdf');
    assert.strictEqual(dmStruct.units[0].title, 'INTRODUCTION TO ONLINE MARKET');
    assert.strictEqual(dmStruct.units[1].title, 'SEARCH ENGINE OPTIMISATION');
    assert.strictEqual(dmStruct.units[2].title, 'E- MAIL MARKETING');
    assert.strictEqual(dmStruct.units[3].title, 'SOCIAL MEDIA MARKETING');
    assert.strictEqual(dmStruct.units[4].title, 'DIGITAL TRANSFORMATION');

    // Unit 2 should contain SEO / SEM / PPC topics
    const u2Topics = dmStruct.units[1].topics.map(t => t.toLowerCase());
    assert(u2Topics.some(t => t.includes('seo') || t.includes('search engine') || t.includes('ppc')), 'Unit 2 must contain SEO/SEM/PPC topics');

    // Unit 5 must not contain Text Books or Course Outcomes
    const u5Topics = dmStruct.units[4].topics.map(t => t.toLowerCase());
    assert(!u5Topics.some(t => t.includes('text books') || t.includes('course outcomes')), 'Unit 5 topics must not be polluted by textbook sections');
  });

  await testAsync('Digital Marketing: Generate 5 grounded questions across all 5 units with rubric balancing', async () => {
    const dmStruct = extractSyllabusStructure(dmSyllabusText, [], '24UCBP10_DIGITAL_MARKETING.pdf');
    const blueprint = {
      subject: 'DIGITAL MARKETING STRATEGIES',
      courseCode: '24UCBP10',
      examType: 'Mid-Term Assessment',
      totalMarks: 30,
      duration: 60,
      uploadedSyllabus: { text: dmSyllabusText },
      verifiedStructure: dmStruct,
      groups: [
        { id: 'part-a', name: 'Part A', type: 'Theory', count: 2, marksPerQ: 3, difficulty: 'Easy' },
        { id: 'part-b', name: 'Part B', type: 'Scenario-Based', count: 2, marksPerQ: 7, difficulty: 'Medium' },
        { id: 'part-c', name: 'Part C', type: 'Application-Based', count: 1, marksPerQ: 10, difficulty: 'Hard' }
      ]
    };

    const mockDoc = { id: 'doc-dm-test', extracted_text: dmSyllabusText };
    const res = await generateAssessmentQuestions(blueprint, mockDoc, 'faculty-janani-001', null);

    assert(res && res.questions, 'Result must contain questions');
    assert.strictEqual(res.questions.length, 5, `Expected 5 questions, got ${res.questions.length}`);

    const totalMarks = res.questions.reduce((sum, q) => sum + q.marks, 0);
    assert.strictEqual(totalMarks, 30, `Total marks must equal 30, got ${totalMarks}`);

    // Verify all rubrics balance
    res.questions.forEach((q, idx) => {
      assert(q.questionText && q.questionText.length > 20, `Question ${idx + 1} text is valid`);
      if (q.rubric && q.rubric.length > 0) {
        const rSum = q.rubric.reduce((acc, r) => acc + (r.marks || 0), 0);
        assert.strictEqual(rSum, q.marks, `Rubric sum for Q${idx + 1} (${rSum}) must match question marks (${q.marks})`);
      }
    });

    console.log(`\n    Verified 5 Digital Marketing questions:`);
    res.questions.forEach(q => {
      console.log(`    - Q${q.questionNumber} [${q.unit} | ${q.marks}M | ${q.questionType}]: ${q.questionText.slice(0, 65)}...`);
    });
  });

  // 8. Test Scanned Photocopy OCR Syllabus: 24UCB512 FUNDAMENTALS OF DATA SCIENCE AND ANALYTICS
  const noisyDataScienceOcr = `
--- PAGE 1 (OCR EXTRACTED) ---
24UCB512 FUNDAMENTALS OF DATA SCIENCE AND ANALYTICS
L/T/P/C 3/0/2/4 PCC
Nature of Course: Laboratory Integrated Theory
Prerequisite(s): Basics of Exploratory Data Analysis and Python Programming
Course Objectives: Enable the students to
- Apply fundamental data science techniques and processes to collect, clean, analyze, and interpret data
- Apply descriptive data analytics techniques to summarize, visualize, and interpret patterns
- Analyze sample data using inferential statistical techniques
- Analyze the differences between multiple group means using Analysis of Variance
- in supporting strategic business decisions

Course Contents:
GNFT[ WrRobuemoN _ Jeoi | 9 |
Need for data science - benefits and uses -Data Science process: setting the research goal - facets of data -retrieving data - cleansing, integrating, and transforming data - exploratory data analysis - build the models - presenting and building applications.

(UNIT | DESCRPTNEANALYTGS [coz | 9 |
Introduction to Descriptive Analytics - Role of descriptive analytics in business decision-making- Data Collection & Preparation: Data wrangling and cleaning for business reports - Handling missing values, outliers, and data inconsistencies, Data integration- Statistics & Business Interpretation: Business use-cases, sales trend summaries, customer segmentation statistics - Data Visualization for Business Insights: Power BI, Tableau, Case study: Creating dashboards for executive reporting

TUNTW | INFERENWALSTATSTICS | cos | 9 |
Inferential Statistics in Business: Role, Sampling techniques and their business relevance - Estimation and Confidence Intervals - Hypothesis Testing - Comparing Groups and Relationships - Business Use-Cases and Case Studies

[ONT | ANAYSSOFVARANGE [cot | 9 |
Introduction to ANOVA - Comparison of ANOVA with t-tests and other hypothesis tests-One-Way ANOVA, Two-Way ANOVA: Business applications, Assumptions - Testing and Diagnostics: Checking normality, homogeneity of variances, Remedies for violations - ANOVA using Statistical Tools

[UNTV | PREDICTVEANALYTCS J cos | 9 |
Role of predictive analytics in business strategy - Data for Predictive Modeling: Feature selection, Handling categorical, numerical, and time-based data, Data splitting, Preparing customer data for churn prediction - Regression Techniques: Sales forecasting, demand prediction, pricing optimization- Classification Techniques: Random Forests and Gradient Boosting - Model Evaluation and Validation: Cross-validation techniques - Overfitting and model generalization.
Theory Hours: 45

PRACTICAL EXERCISES
1. Conduct an exploratory data analysis to summarize data using statistics and visualize key features using charts or graphs
`;

  test('Data Science Scanned OCR: Course code, subject, and clean 5 units extracted', () => {
    const dsStruct = extractSyllabusStructure(noisyDataScienceOcr, [], '24UCB512_Data_Science.pdf');
    assert.strictEqual(dsStruct.courseCode, '24UCB512', `Expected course code 24UCB512, got: ${dsStruct.courseCode}`);
    assert.strictEqual(dsStruct.subject, 'FUNDAMENTALS OF DATA SCIENCE AND ANALYTICS', `Expected subject FUNDAMENTALS OF DATA SCIENCE AND ANALYTICS, got: ${dsStruct.subject}`);
    assert.strictEqual(dsStruct.units.length, 5, `Expected exactly 5 units, got: ${dsStruct.units.length}`);
    assert.strictEqual(dsStruct.units[0].title, 'Introduction');
    assert.strictEqual(dsStruct.units[1].title, 'Descriptive Analytics');
    assert.strictEqual(dsStruct.units[2].title, 'Inferential Statistics');
    assert.strictEqual(dsStruct.units[3].title, 'Analysis of Variance');
    assert.strictEqual(dsStruct.units[4].title, 'Predictive Analytics');
  });

  await testAsync('Data Science Scanned OCR: Generate questions grounded in genuine curriculum topics', async () => {
    const dsStruct = extractSyllabusStructure(noisyDataScienceOcr, [], '24UCB512_Data_Science.pdf');
    const blueprint = {
      subject: dsStruct.subject,
      courseCode: dsStruct.courseCode,
      examType: 'Semester Final',
      totalMarks: 50,
      duration: 90,
      unitsCovered: dsStruct.units.map(u => `${u.unit}: ${u.title}`),
      uploadedSyllabus: { text: noisyDataScienceOcr },
      verifiedStructure: dsStruct,
      groups: [
        { id: 'part-a', name: 'Part A', type: 'Theory', count: 5, marksPerQ: 2, difficulty: 'Easy' },
        { id: 'part-b', name: 'Part B', type: 'Scenario-Based', count: 5, marksPerQ: 8, difficulty: 'Medium' }
      ]
    };

    const mockDoc = { id: 'doc-ds-test', extracted_text: noisyDataScienceOcr };
    const res = await generateAssessmentQuestions(blueprint, mockDoc, 'faculty-janani-001', null);

    assert(res && res.questions, 'Result must contain questions');
    assert.strictEqual(res.questions.length, 10, `Expected 10 questions, got ${res.questions.length}`);

    const totalMarks = res.questions.reduce((sum, q) => sum + q.marks, 0);
    assert.strictEqual(totalMarks, 50, `Total marks must equal 50, got ${totalMarks}`);

    // Ensure questions are distributed across the 5 units
    const unitsPresent = new Set(res.questions.map(q => q.unit));
    assert(unitsPresent.size >= 4, `Questions must cover at least 4 units, covered: ${unitsPresent.size}`);

    // Ensure no question cites PAGE 1 banner
    res.questions.forEach(q => {
      assert(!q.questionText.includes('PAGE 1 (OCR EXTRACTED)'), 'Question text must not cite page markers');
      assert(!q.unit.includes('PAGE 1'), 'Question unit must not be page markers');
    });

    console.log(`\n    Verified all 10 Data Science grounded questions across clean units:`);
    res.questions.slice(0, 5).forEach(q => {
      console.log(`    - Q${q.questionNumber} [${q.unit} | ${q.marks}M | ${q.questionType}]: ${q.questionText.slice(0, 65)}...`);
    });
  });

  // 9. Test Scanned Photocopy OCR with CUNTW and Merged OCR (Exact User Text)
  const exactUserPastedOcr = `
Apply fundamental data science techniques and processes to collect, clean, analyze,
Apply descriptive data analytics techniques to summarize, visualize, and interpret
hypotheses, and interpret the significance of results.

Analyze the differences between multiple group means using Analysis of Variance

in supporting strategic business decisions.

GNFT  WiRobueTON Jet |__|
facets of data - retrieving data — cleansing, integrating, and transforming data — exploratory data
analysis — build the models — presenting and building applications.

[ONT | DESCRIPTWEANALYTGS ~ [coz | _ 8 |
Introduction to Descriptive Analytics - Role of descriptive analytics in business decision-making-
Data Collection & Preparation: Data wrangling and cleaning for business reports - Handling
missing values, outliers, and data inconsistencies, Data integration- Statistics & Business
Interpretation; Business use-cases, sales trend summaries, customer segmentation statistics - Data
Visualization for Business Insights: Power Bl, Tableau, Case study: Creating dashboards for
executive reporting

CUNTW | INFERENWALSTATSTCS [os | 9 |
Estimation and Confidence Intervals - Hypothesis Testing - Comparing Groups and Relationships -
Business Use-Cases and Case Studies

[ONT | ANAVSSOFVARANGE [cod | __ 9 |
Introduction to ANOVA - Comparison of ANOVA with t-tests and other hypothesis tests-One-

Way ANOVA , Two-Way ANOVA: Business applications, Assumptions - Testing and
Diagnostics: Checking normality, homogeneity of variances, Remedies for violations -
ANOVA using Statistical Tools

[ONTV | PREDICTNEANALYAGS [cos | 5 |
Role of predictive analytics in business strategy - Data for Predictive Modeling: Feature
selection, Handling categorical, numerical, and time-based data, Data splitting, Preparing
customer data for churn prediction - Regression Techniques: Sales forecasting, demand
prediction, pricing optimization- Classification Techniques: Random Forests and Gradient
Boosting - Mode! Evaluation and Validation: Cross-validation techniques
Overfitting and model generalization.

- TT  TheoryHoursi| 45 |

rg ee TE EE 01

key features using charts or graphs

Using a real-world dataset of study hours vs. exam scores, create a scatter plot to
visualize the relationship between the two variables
Collect a sample dataset from a real-world source and calculate the sampling
distribution and standard error of the mean for a chosen variable
Use one-way ANOVA to determine whether there are statistically significant Cco4
differences between the means of three or more independent groups, Calculate and
report the F-statistic and p-value.
Implement linear least squares regression to model the relationship between variables; C05
evaluate the goodness of fit and test the significance of the model parameters
Perform logistic regression for a Classification problem within the dataset and evaluate] COS
the model's performance
7. | Open ended experiment cot —
C05
Practical Hours: [3 |
COURSE OUTCOMES
At the end of the course students will be able to
CO1 Analyze the data science process to design complete analytical workflows from data
collection to model deployment for real-world problem-solving.
Apply descriptive analytics and visualization tools to derive business insights that support
strategic decision-making.
CO3 [Evaluate business data using inferential statistical techniques to draw valid conclusions for
Jata-driven decisions.
CO4 |Analyze and interpret ANOVA results to compare business factors and determine statistical
significance in datasets.
COB [Develop and validate predictive models using regression and classification methods to forecast
outcomes and optimize business strategies.
Text Books:
1 Jugal K. Kalita, Dhruba K. Bhattacharyya, Swarup Roy, “Fundamentals of Data Science:
Theory and Practice”, 1st Edition, Academic Press, November 2023
2 Ramesh Sharda, Dursun Delen, Efraim Turban,” Business Intelligence, Analytics, and
Data Science:
A Managerial Perspective”, 4th Edition, Pearson, 2024
Reference Books:
1 Brian Murray,” Data Science for Beginners: An Introduction to the Fundamentals of Data
Analysis and Machine Learning, 1st Edition, Independently published, March 2023
2 Sanjeev J. Wagh, Manisha S. Bhende, Anuradha D. Thakare, “Fundamentals of Data
Science”, 1st edition, CRC Press, 2022.
Online Resources:
C1] ipeGaveiopers googie comimadinereamingloash Cosel
2 | Ee  btaeamp comHagredveanahics QU Um_Sou zo h Gp 2
3 ips rw Springboard comblogiaata-sciencel date: science”
rocess/2utm_source=chatg pt.com
`;

  test('Exact User Scanned OCR: Extracts clean 5 units and proper Subject Name', () => {
    const struct = extractSyllabusStructure(exactUserPastedOcr, [], '24UCB512_Data_Science.pdf');
    assert.strictEqual(struct.units.length, 5, `Expected 5 units, got: ${struct.units.length}`);
    assert.strictEqual(struct.units[0].title, 'Introduction');
    assert.strictEqual(struct.units[1].title, 'Descriptive Analytics');
    assert.strictEqual(struct.units[2].title, 'Inferential Statistics');
    assert.strictEqual(struct.units[3].title, 'Analysis of Variance');
    assert.strictEqual(struct.units[4].title, 'Predictive Analytics');
    assert.ok(struct.subject.toLowerCase().includes('data science'), 'Subject must detect data science');
    assert.ok(!struct.subject.toLowerCase().includes('apply'), 'Subject must never be an objective clause');
  });

  console.log(`Known-Document Grounding Tests: ${passedTests}/${totalTests} Passed`);
  console.log(`===================================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runKnownDocumentTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
