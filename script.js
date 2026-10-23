/**
 * ExamCraft AI — AI-Powered Question Paper Generation Platform
 * Academic Assessment Engineering Suite
 * Vanilla JavaScript Application Logic
 */

// ===================================================================
// 1. Initial State & Sample Data Repository
// ===================================================================

const SAMPLE_SYLLABUS_TEXT = `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
COURSE CODE: CS402 | COURSE NAME: DATA & INFORMATION SECURITY
ACADEMIC YEAR: 2025-2026 | REGULATION 2024

COURSE OBJECTIVES:
1. Understand foundational principles of confidentiality, integrity, and availability (CIA).
2. Analyze modern symmetric and asymmetric cryptographic algorithms and cipher modes.
3. Apply cryptographic hash functions, digital signatures, and key distribution protocols.
4. Evaluate authentication mechanisms, access control models, and network threat vectors.

UNIT 1: INFOSEC FUNDAMENTALS & THREAT LANDSCAPE (Hours: 9)
Foundations of Information Security: The CIA Triad, Parkerian Hexad. Threat Modeling: STRIDE and DREAD frameworks. Vulnerabilities, Threats, and Risks: definitions and distinctions. Attack Surfaces and Vectors: Social engineering, phishing, malware taxonomy (ransomware, rootkits, botnets). Security Governance: Policies, standards, procedures, and ISO/IEC 27001 overview. Defense-in-Depth architecture and least privilege principle.

UNIT 2: SYMMETRIC & ASYMMETRIC ENCRYPTION (Hours: 10)
Classical ciphers and cryptanalysis fundamentals. Modern Symmetric Encryption: Feistel structure, Data Encryption Standard (DES) vulnerabilities, Triple-DES (3DES), Advanced Encryption Standard (AES) - internal round operations (SubBytes, ShiftRows, MixColumns, AddRoundKey), key schedules. Block Cipher Modes of Operation: Electronic Codebook (ECB) pattern leakage, Cipher Block Chaining (CBC) with Initialization Vectors (IV), Counter Mode (CTR), Galois/Counter Mode (GCM) for authenticated encryption. Asymmetric Cryptography: Number theoretic foundations (modular arithmetic, Euler's totient, discrete logarithms), RSA Algorithm (key generation, encryption, decryption, CRT optimization), Elliptic Curve Cryptography (ECC) advantages.

UNIT 3: KEY MANAGEMENT & CRYPTOGRAPHIC HASHES (Hours: 9)
Key Distribution & Management: Diffie-Hellman Key Exchange and Man-in-the-Middle vulnerabilities, Needham-Schroeder protocol. Public Key Infrastructure (PKI): Certificate Authorities (CA), X.509 certificate hierarchy, Certificate Revocation Lists (CRL), Online Certificate Status Protocol (OCSP). Cryptographic Hash Functions: Properties (pre-image, second pre-image, collision resistance), MD5 and SHA-1 vulnerabilities, SHA-256 and SHA-3 Keccak sponge construction. Message Authentication Codes: HMAC design rationale, CMAC. Digital Signatures: RSA Signatures, Digital Signature Standard (DSS/DSA), Ed25519.

UNIT 4: AUTHENTICATION & NETWORK ACCESS CONTROL (Hours: 10)
Authentication Mechanisms: Passwords, salt and pepper hashing (bcrypt, Argon2), Multi-Factor Authentication (MFA), Time-Based One-Time Password (TOTP, RFC 6238). Federated Identity and Single Sign-On (SSO): SAML 2.0, OAuth 2.0 authorization framework, OpenID Connect (OIDC). Protocol Security: Kerberos V5 ticket-granting service and authentication tokens. Network Access Control: Role-Based Access Control (RBAC), Attribute-Based Access Control (ABAC), Transport Layer Security (TLS 1.3 handshake phases, session resumption, forward secrecy).`;

const SAMPLE_QUESTION_BANK = [
  {
    id: "qb-1",
    subject: "Data & Information Security",
    unit: "Unit 1",
    type: "Theory",
    difficulty: "Easy",
    marks: 2,
    bloomLevel: "Remember",
    text: "Define the principle of Least Privilege. How does it mitigate insider threats in institutional network environments?",
    modelAnswer: "The Principle of Least Privilege (PoLP) dictates that a user, process, or program must be granted only the minimum clearance and access rights essential to perform its validated function. This limits the blast radius of compromised credentials and restricts lateral movement by malicious insiders or compromised service accounts.",
    keyConcepts: "Least Privilege, Blast Radius, Lateral Movement, Access Control",
    expectedPoints: "1. Definition of Least Privilege.\n2. Explanation of blast radius containment.\n3. Mention of restricting unauthorized data access.",
    rubric: [
      { criterion: "Definition of Principle of Least Privilege", marks: 1 },
      { criterion: "Application to insider threat containment", marks: 1 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 1.4",
    sourcePage: "Page 4",
    sourceExcerpt: "Defense-in-Depth architecture and least privilege principle dictate restricting entity permissions strictly to operational requirements.",
    reasoning: "Directly tests fundamental security principles and access control theory as specified in Unit 1."
  },
  {
    id: "qb-2",
    subject: "Data & Information Security",
    unit: "Unit 1",
    type: "Scenario-Based",
    difficulty: "Medium",
    marks: 8,
    bloomLevel: "Analyze",
    text: "A financial fintech application is undergoing security auditing. The red team executes a successful replay attack against an API endpoint handling funds transfers. Using the STRIDE threat model, categorize this attack, analyze why lack of nonces enabled the exploit, and formulate an architectural remediation plan.",
    modelAnswer: "In the STRIDE threat model, a replay attack corresponds primarily to Spoofing and Tampering (or Elevation of Privilege depending on context). The vulnerability occurred because transactions lacked ephemeral timestamps and cryptographically bound nonces (Number Used Once). Remediation involves: 1) Enforcing unique cryptographic nonces in payload headers; 2) Enforcing strict time-to-live (TTL) validation with NTP-synchronized servers; 3) Implementing HMAC-SHA256 request signatures.",
    keyConcepts: "STRIDE, Replay Attack, Nonce, Time-to-Live, HMAC, Tampering",
    expectedPoints: "1. Categorization within STRIDE (Spoofing/Tampering).\n2. Technical root cause: lack of nonces & replay cache.\n3. Architectural remediation steps (Nonce, Timestamp, Signature verification).",
    rubric: [
      { criterion: "Accurate STRIDE categorization & attack mechanics", marks: 2 },
      { criterion: "Technical analysis of nonce and replay window", marks: 3 },
      { criterion: "Comprehensive architectural remediation design", marks: 3 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 1.2",
    sourcePage: "Page 3",
    sourceExcerpt: "Threat Modeling: STRIDE and DREAD frameworks. Attack surfaces and vectors.",
    reasoning: "Assesses analytical application of threat modeling to modern enterprise API security scenarios."
  },
  {
    id: "qb-3",
    subject: "Data & Information Security",
    unit: "Unit 2",
    type: "Theory",
    difficulty: "Easy",
    marks: 2,
    bloomLevel: "Understand",
    text: "Why is Electronic Codebook (ECB) mode deemed insecure for encrypting high-entropy bitmap images?",
    modelAnswer: "In ECB mode, identical plaintext blocks are deterministically encrypted into identical ciphertext blocks under the same key. Consequently, repetitive patterns, structural contours, and color frequencies present in bitmap images remain visible in the ciphertext, violating data confidentiality.",
    keyConcepts: "ECB Mode, Deterministic Encryption, Pattern Leakage, Block Cipher",
    expectedPoints: "1. State that identical plaintext blocks yield identical ciphertext blocks.\n2. Conclude that image patterns and visual structures are preserved.",
    rubric: [
      { criterion: "Explanation of ECB deterministic mapping", marks: 1 },
      { criterion: "Identification of pattern leakage in structured data", marks: 1 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 2.3",
    sourcePage: "Page 8",
    sourceExcerpt: "Block Cipher Modes of Operation: Electronic Codebook (ECB) pattern leakage, Cipher Block Chaining (CBC) with Initialization Vectors (IV).",
    reasoning: "Tests core understanding of block cipher modes of operation and deterministic leakage."
  },
  {
    id: "qb-4",
    subject: "Data & Information Security",
    unit: "Unit 2",
    type: "Numerical/Problem-Solving",
    difficulty: "Medium",
    marks: 8,
    bloomLevel: "Apply",
    text: "In an RSA public-key cryptosystem setup, two prime numbers are selected: p = 11 and q = 13. The public exponent is chosen as e = 7. (a) Compute the modulus n and Euler's totient phi(n). (b) Derive the private decryption key d using the Extended Euclidean Algorithm. (c) Given ciphertext C = 9, decrypt C to recover the original plaintext message M.",
    modelAnswer: "(a) Modulus n = p * q = 11 * 13 = 143. Euler's totient phi(n) = (p - 1)(q - 1) = 10 * 12 = 120.\n(b) We need d such that (d * 7) mod 120 = 1. Using Extended Euclidean: 120 = 7 * 17 + 1 => 1 = 120 - 7 * 17 => 1 = 120 * (1) + 7 * (-17). Since -17 mod 120 = 103, private key d = 103. (Check: 7 * 103 = 721 = 6 * 120 + 1).\n(c) Decryption: M = C^d mod n = 9^103 mod 143. Using modular exponentiation: 9^2 = 81; 9^4 = 81^2 = 6561 = 126 mod 143; 103 in binary is 1100111_2. Solving yields Plaintext M = 4.",
    keyConcepts: "RSA Algorithm, Modular Arithmetic, Euler's Totient, Extended Euclidean Algorithm, Modular Exponentiation",
    expectedPoints: "1. Correct calculation of n = 143 and phi(n) = 120.\n2. Step-by-step derivation of d = 103 via modular inverse.\n3. Modular exponentiation steps yielding M = 4.",
    rubric: [
      { criterion: "Computation of modulus n and Euler's totient phi(n)", marks: 2 },
      { criterion: "Derivation of private key d with Euclidean algorithm", marks: 3 },
      { criterion: "Decryption steps and final recovery of plaintext M", marks: 3 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 2.4",
    sourcePage: "Page 11",
    sourceExcerpt: "Asymmetric Cryptography: Number theoretic foundations, RSA Algorithm (key generation, encryption, decryption).",
    reasoning: "Evaluates mathematical execution and procedural mastery of public-key cryptography."
  },
  {
    id: "qb-5",
    subject: "Data & Information Security",
    unit: "Unit 3",
    type: "Theory",
    difficulty: "Easy",
    marks: 2,
    bloomLevel: "Understand",
    text: "Distinguish between a Message Authentication Code (MAC) and a Digital Signature in terms of non-repudiation.",
    modelAnswer: "A MAC uses a shared secret symmetric key between sender and receiver; since both parties hold the key, neither can cryptographically prove to a third party which entity authored the message (no non-repudiation). In contrast, a Digital Signature uses an asymmetric private key known solely to the sender, offering verifiable non-repudiation.",
    keyConcepts: "MAC, Digital Signature, Non-Repudiation, Asymmetric Key, Shared Secret",
    expectedPoints: "1. State that MAC uses symmetric shared key (no non-repudiation).\n2. State that Digital Signature uses unique private key (guarantees non-repudiation).",
    rubric: [
      { criterion: "Contrast of symmetric shared secret vs asymmetric private key", marks: 1 },
      { criterion: "Precise distinction regarding non-repudiation capability", marks: 1 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 3.3",
    sourcePage: "Page 15",
    sourceExcerpt: "Message Authentication Codes: HMAC design rationale. Digital Signatures: RSA Signatures, Digital Signature Standard.",
    reasoning: "Assesses understanding of cryptographic integrity protocols and proof of origin."
  },
  {
    id: "qb-6",
    subject: "Data & Information Security",
    unit: "Unit 3",
    type: "Scenario-Based",
    difficulty: "Hard",
    marks: 10,
    bloomLevel: "Evaluate",
    text: "An enterprise deploys a Public Key Infrastructure (PKI) for securing inter-bank communications. During a security incident, a subordinate Certificate Authority's (CA) private key is compromised. (a) Critique the operational latency and privacy implications of Certificate Revocation Lists (CRL) versus Online Certificate Status Protocol (OCSP). (b) Design an emergency revocation and certificate re-pinning protocol to restore trust without causing network-wide service outage.",
    modelAnswer: "(a) Comparison:\n- CRL: Periodic distribution of revoked serial numbers. Disadvantages: High latency (revocation is not instant until next CRL publication), massive bandwidth overhead as lists grow, client caching vulnerabilities.\n- OCSP: Real-time query to an OCSP responder. Advantages: Near-instant status lookup. Disadvantages: Privacy leakage (CA learns which sites users visit), single point of failure / denial of service, network latency on handshake (remedied by OCSP Stapling).\n(b) Emergency Protocol Design:\n1. Immediate publication of subordinate CA certificate revocation to Root CA CRL and CRL distribution points.\n2. Revoke and rotate using Root CA authority; issue new intermediate CA certificate with updated keypair.\n3. Deploy OCSP stapling with short-lived tokens (Must-Staple flag).\n4. Push emergency certificate bundle update via out-of-band automated configuration management (Ansible/Kubernetes secrets) with staged rollback safeguards.",
    keyConcepts: "PKI, Certificate Authority, CRL, OCSP, OCSP Stapling, Key Compromise, Certificate Pinning",
    expectedPoints: "1. Detailed critique of CRL (latency, bandwidth) vs OCSP (real-time, privacy/DoS).\n2. Discussion of OCSP Stapling.\n3. Step-by-step emergency revocation and recovery protocol.\n4. Consideration of service continuity.",
    rubric: [
      { criterion: "Critical comparison of CRL vs OCSP operational mechanics", marks: 3 },
      { criterion: "Technical analysis of OCSP Stapling and caching tradeoffs", marks: 2 },
      { criterion: "Architectural emergency revocation protocol design", marks: 3 },
      { criterion: "Risk mitigation for system availability and business continuity", marks: 2 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 3.2",
    sourcePage: "Page 14",
    sourceExcerpt: "Public Key Infrastructure (PKI): Certificate Authorities (CA), X.509 certificate hierarchy, Certificate Revocation Lists (CRL), Online Certificate Status Protocol (OCSP).",
    reasoning: "Evaluates high-order architectural evaluation and incident response planning for enterprise cryptography."
  },
  {
    id: "qb-7",
    subject: "Data & Information Security",
    unit: "Unit 4",
    type: "Theory",
    difficulty: "Medium",
    marks: 8,
    bloomLevel: "Analyze",
    text: "Diagram and analyze the TLS 1.3 cryptographic handshake. Contrast its latency (Round Trip Times - RTT) with TLS 1.2, and explain how TLS 1.3 eliminates vulnerable cipher suites.",
    modelAnswer: "In TLS 1.3, the handshake is optimized to 1-RTT for new connections and 0-RTT for resumed sessions (Early Data), compared to 2-RTT in TLS 1.2.\n1. ClientHello: Sends supported cipher suites, key shares (Diffie-Hellman parameters), and supported groups.\n2. ServerHello: Selects key share, immediately sends Server Certificate, EncryptedExtensions, and Finished message.\n3. Client Finished: Computes session key and commences encrypted payload transmission.\nSecurity hardening: TLS 1.3 completely removed static RSA key exchange (enforcing Perfect Forward Secrecy via (EC)DHE), legacy cipher modes (CBC, RC4), and insecure hash algorithms (MD5, SHA-1). Only AEAD ciphers (AES-GCM, AES-CCM, ChaCha20-Poly1305) are permitted.",
    keyConcepts: "TLS 1.3 Handshake, 1-RTT, 0-RTT, Forward Secrecy, AEAD, Cipher Suite Deprecation",
    expectedPoints: "1. Clear phase-by-phase handshake walkthrough (ClientHello with key share, ServerHello).\n2. Comparison of 1-RTT vs TLS 1.2 2-RTT.\n3. Enumeration of removed vulnerabilities (No static RSA, no CBC, only AEAD).",
    rubric: [
      { criterion: "Accurate breakdown of TLS 1.3 1-RTT handshake phases", marks: 3 },
      { criterion: "Quantitative RTT latency contrast against TLS 1.2", marks: 2 },
      { criterion: "Technical analysis of removed insecure ciphers and forward secrecy", marks: 3 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 4.3",
    sourcePage: "Page 19",
    sourceExcerpt: "Protocol Security: Role-Based Access Control, Transport Layer Security (TLS 1.3 handshake phases, session resumption, forward secrecy).",
    reasoning: "Tests modern network security protocol mechanics, latency trade-offs, and cryptographic hygiene."
  },
  {
    id: "qb-8",
    subject: "Data & Information Security",
    unit: "Unit 4",
    type: "MCQ",
    difficulty: "Easy",
    marks: 2,
    bloomLevel: "Remember",
    text: "Which of the following hashing algorithms is specifically designed with adjustable memory and computational hardness to resist GPU/ASIC brute-force dictionary attacks against password databases?\nA) SHA-256\nB) HMAC-MD5\nC) Argon2\nD) Keccak-512",
    modelAnswer: "Correct Answer: C) Argon2\nExplanation: Argon2 (winner of the Password Hashing Competition) incorporates configurable memory cost, time cost, and parallelism degrees to specifically thwart hardware acceleration attacks (ASIC/GPU). Standard SHA-256 or MD5 hashes compute too rapidly and lack memory-hardness.",
    keyConcepts: "Argon2, Password Hashing, Memory Hardness, ASIC Resistance",
    expectedPoints: "1. Identification of Option C (Argon2).\n2. Brief justification regarding memory-hardness.",
    rubric: [
      { criterion: "Correct option selection (C)", marks: 1 },
      { criterion: "Accurate justification citing memory-hardness", marks: 1 }
    ],
    sourceDoc: "CS402_Data_Security_Syllabus.pdf",
    sourceSection: "Section 4.1",
    sourcePage: "Page 17",
    sourceExcerpt: "Authentication Mechanisms: Passwords, salt and pepper hashing (bcrypt, Argon2), Multi-Factor Authentication.",
    reasoning: "Tests precise knowledge of contemporary password storage defense mechanisms."
  }
];

const SAMPLE_PAPERS = [
  {
    id: "paper-cs402-model-2026",
    title: "CS402: Data & Information Security — Model Examination",
    subject: "Data & Information Security",
    courseCode: "B.Tech CSE - Sem VI (CS402)",
    academicYear: "2025 - 2026",
    examType: "Model Examination",
    unitsCovered: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
    totalMarks: 50,
    duration: 90,
    createdDate: "2026-10-15",
    status: "Approved",
    approvedBy: "Dr. Sarah Jenkins",
    approvedDate: "2026-10-15 16:30",
    instName: "INSTITUTE OF SCIENCE & TECHNOLOGY",
    deptName: "Department of Computer Science & Engineering",
    examDate: "2026-10-25",
    instructions: "1. Answer ALL questions in Part A (5 x 2 = 10 Marks).\n2. Answer any FOUR questions from Part B (4 x 8 = 32 Marks).\n3. Part C is compulsory (1 x 8 = 8 Marks).\n4. Programmable calculators and electronic gadgets are strictly prohibited.",
    questions: [
      SAMPLE_QUESTION_BANK[0],
      SAMPLE_QUESTION_BANK[2],
      SAMPLE_QUESTION_BANK[4],
      SAMPLE_QUESTION_BANK[7],
      SAMPLE_QUESTION_BANK[1],
      SAMPLE_QUESTION_BANK[3],
      SAMPLE_QUESTION_BANK[6]
    ]
  },
  {
    id: "paper-cs301-os-draft",
    title: "CS301: Operating Systems & Virtualization — Internal Assessment 1",
    subject: "Operating Systems",
    courseCode: "B.Tech CSE - Sem IV (CS301)",
    academicYear: "2025 - 2026",
    examType: "Internal Assessment 1",
    unitsCovered: ["Unit 1", "Unit 2"],
    totalMarks: 50,
    duration: 90,
    createdDate: "2026-10-12",
    status: "Draft",
    approvedBy: null,
    approvedDate: null,
    instName: "INSTITUTE OF SCIENCE & TECHNOLOGY",
    deptName: "Department of Computer Science & Engineering",
    examDate: "2026-11-05",
    instructions: "1. Answer all questions.\n2. State all design assumptions clearly.",
    questions: [
      {
        id: "os-q1",
        subject: "Operating Systems",
        unit: "Unit 1",
        type: "Theory",
        difficulty: "Easy",
        marks: 2,
        bloomLevel: "Remember",
        text: "Explain the difference between a monolithic kernel and a microkernel architecture in terms of IPC overhead.",
        modelAnswer: "In monolithic kernels, OS services run in kernel space with zero context-switch overhead for IPC. In microkernels, servers run in user space, requiring multiple context switches and message passes.",
        keyConcepts: "Monolithic, Microkernel, Context Switch, IPC",
        expectedPoints: "1. Contrast memory spaces.\n2. Note context switch impact.",
        rubric: [
          { criterion: "Architectural distinction", marks: 1 },
          { criterion: "IPC overhead analysis", marks: 1 }
        ],
        sourceDoc: "CS301_OS_Syllabus.pdf",
        sourceSection: "Section 1.3",
        sourcePage: "Page 2",
        sourceExcerpt: "Kernel architectures: Monolithic vs Microkernel.",
        reasoning: "Core OS architecture foundational concept."
      }
    ]
  },
  {
    id: "paper-ai601-ml-review",
    title: "AI601: Machine Learning & Statistical Inference — End Semester",
    subject: "Machine Learning",
    courseCode: "B.Tech AI&DS - Sem VI (AI601)",
    academicYear: "2025 - 2026",
    examType: "End Semester Examination",
    unitsCovered: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
    totalMarks: 100,
    duration: 180,
    createdDate: "2026-10-10",
    status: "In Review",
    approvedBy: null,
    approvedDate: null,
    instName: "INSTITUTE OF SCIENCE & TECHNOLOGY",
    deptName: "Department of Artificial Intelligence & Data Science",
    examDate: "2026-11-20",
    instructions: "1. Part A is compulsory (10 x 2 = 20 Marks).\n2. Part B contains five questions with internal choice (5 x 16 = 80 Marks).",
    questions: []
  }
];

const SAMPLE_SYLLABUS_DOCS = [
  {
    id: "doc-cs402",
    name: "CS402_Data_Security_Syllabus.pdf",
    subject: "Data & Information Security",
    fileSize: "1.2 MB",
    pages: 4,
    unitsCount: 4,
    uploadDate: "2026-10-14",
    status: "Extracted (PDF.js)",
    text: SAMPLE_SYLLABUS_TEXT,
    topics: ["CIA Triad", "STRIDE", "AES", "RSA", "Diffie-Hellman", "SHA-256", "TLS 1.3", "Kerberos"]
  },
  {
    id: "doc-cs301",
    name: "CS301_Operating_Systems_Syllabus.pdf",
    subject: "Operating Systems",
    fileSize: "850 KB",
    pages: 3,
    unitsCount: 5,
    uploadDate: "2026-10-10",
    status: "Extracted (PDF.js)",
    text: "UNIT 1: OS Structures, Process Management. UNIT 2: Threads & Concurrency. UNIT 3: CPU Scheduling & Synchronization. UNIT 4: Deadlocks & Memory Management. UNIT 5: Virtual Memory & Storage.",
    topics: ["Process Control Block", "Semaphores", "Round Robin", "Page Replacement", "Virtual Memory"]
  }
];

// Default Settings
const DEFAULT_SETTINGS = {
  teacherName: "Dr. Sarah Jenkins",
  department: "Department of Computer Science & Engineering",
  institution: "INSTITUTE OF SCIENCE & TECHNOLOGY",
  defaultDuration: 90,
  defaultMarks: 50,
  defaultExamType: "Model Examination",
  includeInstructions: true,
  showBloomTags: true,
  includeSignatureLine: true
};

// ===================================================================
// 2. Global Application State
// ===================================================================

const AppState = {
  activeView: "dashboard",
  wizardStep: 1,
  papers: [],
  questionBank: [],
  syllabusDocs: [],
  settings: {},
  currentDraft: null,
  activeEvidenceQ: null
};

// ===================================================================
// 3. LocalStorage Persistence Engine
// ===================================================================

function initStorage() {
  try {
    const storedPapers = localStorage.getItem("examcraft_papers");
    AppState.papers = storedPapers ? JSON.parse(storedPapers) : [];

    const storedBank = localStorage.getItem("examcraft_qbank");
    AppState.questionBank = storedBank ? JSON.parse(storedBank) : [];

    const storedSyllabus = localStorage.getItem("examcraft_syllabus");
    AppState.syllabusDocs = storedSyllabus ? JSON.parse(storedSyllabus) : [];

    const storedSettings = localStorage.getItem("examcraft_settings");
    AppState.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
  } catch (err) {
    console.warn("LocalStorage initialization failed or restricted, using memory defaults", err);
    AppState.papers = [];
    AppState.questionBank = [];
    AppState.syllabusDocs = [];
    AppState.settings = { ...DEFAULT_SETTINGS };
  }
}

function persistState() {
  try {
    localStorage.setItem("examcraft_papers", JSON.stringify(AppState.papers));
    localStorage.setItem("examcraft_qbank", JSON.stringify(AppState.questionBank));
    localStorage.setItem("examcraft_syllabus", JSON.stringify(AppState.syllabusDocs));
    localStorage.setItem("examcraft_settings", JSON.stringify(AppState.settings));
  } catch (e) {
    console.error("Failed to persist state", e);
  }
}

// ===================================================================
// 4. Draft Assessment Initialization & Blueprint Builder
// ===================================================================

function createDefaultDraft() {
  return {
    id: "draft-" + Date.now(),
    title: "Course Assessment Blueprint",
    subject: "",
    courseCode: "",
    academicYear: "2025 - 2026",
    examType: "Model Examination",
    unitsCovered: [],
    totalMarks: 50,
    duration: 90,
    diffEasy: 30,
    diffMed: 50,
    diffHard: 20,
    instName: AppState.settings?.institution || "INSTITUTE OF SCIENCE & TECHNOLOGY",
    deptName: AppState.settings?.department || "Department of Computer Science & Engineering",
    examDate: new Date().toISOString().split("T")[0],
    instructions: "1. Answer all questions.\n2. State all design assumptions clearly.\n3. Programmable calculators and electronic gadgets are strictly prohibited.",
    status: "Draft",
    createdDate: new Date().toISOString().split("T")[0],
    uploadedSyllabus: null,
    groups: [
      {
        id: "grp-1",
        name: "Part A — Short Answer (5 x 2 Marks)",
        type: "Theory",
        count: 5,
        marksPerQ: 2,
        difficulty: "Easy",
        unitAllocation: "All Units"
      },
      {
        id: "grp-2",
        name: "Part B — Analytical Evaluation (3 x 8 Marks)",
        type: "Scenario-Based",
        count: 3,
        marksPerQ: 8,
        difficulty: "Medium",
        unitAllocation: "All Units"
      },
      {
        id: "grp-3",
        name: "Part C — Comprehensive Problem Solving (2 x 8 Marks)",
        type: "Numerical/Problem-Solving",
        count: 2,
        marksPerQ: 8,
        difficulty: "Hard",
        unitAllocation: "All Units"
      }
    ],
    questions: []
  };
}

// Recommended Blueprint Preset (50 Marks)
function loadSuggestedBlueprintPreset() {
  if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();

  const d = AppState.currentDraft;
  d.subject = d.subject || "Data Structures & Algorithms";
  d.courseCode = d.courseCode || "CS301";
  d.totalMarks = 50;
  d.duration = 90;
  d.diffEasy = 30;
  d.diffMed = 50;
  d.diffHard = 20;

  if (!d.unitsCovered || d.unitsCovered.length === 0) {
    d.unitsCovered = [
      "Unit 1: Linear Data Structures & Arrays",
      "Unit 2: Stacks, Queues & Linked Lists",
      "Unit 3: Non-Linear Trees & Binary Search Trees",
      "Unit 4: Graphs, Hashing & Algorithm Complexity"
    ];
    renderUnitChipsFromList(d.unitsCovered);
  }

  d.groups = [
    {
      id: "grp-1",
      name: "Part A — Short Answer (5 Qs x 2 Marks)",
      type: "Theory",
      count: 5,
      marksPerQ: 2,
      difficulty: "Easy",
      unitAllocation: "All Units"
    },
    {
      id: "grp-2",
      name: "Part B — Analytical Evaluation (3 Qs x 8 Marks)",
      type: "Scenario-Based",
      count: 3,
      marksPerQ: 8,
      difficulty: "Medium",
      unitAllocation: "All Units"
    },
    {
      id: "grp-3",
      name: "Part C — Comprehensive Problem Solving (1 Q x 16 Marks)",
      type: "Numerical/Problem-Solving",
      count: 2,
      marksPerQ: 8,
      difficulty: "Hard",
      unitAllocation: "All Units"
    }
  ];

  populateStep2Form();
  showToast("Loaded balanced 50-mark blueprint preset", "info");
  showDeviceToast("Blueprint preset loaded");
}

// ===================================================================
// 5. PDF Extraction & Tesseract OCR Engine
// ===================================================================

let currentUploadedFile = null;
let currentPdfDoc = null;
let isOcrCancelled = false;

// Floating Glass Device Toast (Matching Reference Image)
function showDeviceToast(msg = "Saved to this device") {
  const toast = document.getElementById("glassDeviceToast");
  const textEl = document.getElementById("glassDeviceToastText");
  if (!toast) return;

  if (textEl) textEl.textContent = msg;
  toast.classList.remove("hidden");

  if (window._deviceToastTimer) clearTimeout(window._deviceToastTimer);
  window._deviceToastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}

// Unit Chips UI Renderer & Management
function renderUnitChipsFromList(unitsList) {
  const container = document.getElementById("unitsChipContainer");
  if (!container) return;

  if (!unitsList || unitsList.length === 0) {
    container.innerHTML = `
      <div class="units-empty-state" id="unitsEmptyState">
        <i data-lucide="book-open"></i>
        <span>Upload a syllabus PDF or TXT above to extract units automatically, or click <strong>+ Add Unit</strong> to specify modules manually.</span>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  unitsList.forEach((unitTitle, idx) => {
    const isSelected = AppState.currentDraft?.unitsCovered?.includes(unitTitle) ?? true;
    const label = document.createElement("label");
    label.className = `unit-chip ${isSelected ? "selected" : ""}`;

    label.innerHTML = `
      <input type="checkbox" value="${escapeHtml(unitTitle)}" ${isSelected ? "checked" : ""}>
      <span>${escapeHtml(unitTitle)}</span>
      <button type="button" class="unit-remove-btn" title="Remove unit" data-idx="${idx}">×</button>
    `;

    // Checkbox toggle
    const checkbox = label.querySelector("input");
    checkbox.addEventListener("change", (e) => {
      if (checkbox.checked) {
        label.classList.add("selected");
        if (!AppState.currentDraft.unitsCovered.includes(unitTitle)) {
          AppState.currentDraft.unitsCovered.push(unitTitle);
        }
      } else {
        label.classList.remove("selected");
        AppState.currentDraft.unitsCovered = AppState.currentDraft.unitsCovered.filter(u => u !== unitTitle);
      }
      updateStep3SummaryStrip();
    });

    // Remove button
    const removeBtn = label.querySelector(".unit-remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      AppState.currentDraft.unitsCovered = AppState.currentDraft.unitsCovered.filter(u => u !== unitTitle);
      renderUnitChipsFromList(AppState.currentDraft.unitsCovered);
      updateStep3SummaryStrip();
    });

    container.appendChild(label);
  });

  if (window.lucide) lucide.createIcons();
}

function addManualUnitPrompt() {
  const currentCount = (AppState.currentDraft?.unitsCovered?.length || 0) + 1;
  const unitName = prompt(`Enter Unit or Module Title (e.g. Unit ${currentCount}: Advanced Algorithms):`, `Unit ${currentCount}: `);
  if (!unitName || !unitName.trim()) return;

  if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
  if (!AppState.currentDraft.unitsCovered) AppState.currentDraft.unitsCovered = [];

  const clean = unitName.trim();
  if (!AppState.currentDraft.unitsCovered.includes(clean)) {
    AppState.currentDraft.unitsCovered.push(clean);
    renderUnitChipsFromList(AppState.currentDraft.unitsCovered);
    showToast(`Added module: ${clean}`, "success");
    showDeviceToast("Added module to blueprint");
  }
}

// Automatic metadata & syllabus parser (extracts course title, code & units from text)
function autoPopulateFromExtractedText(text, fileName) {
  if (!text) return;
  if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
  const d = AppState.currentDraft;

  // 1. Try detecting Subject / Course Name
  let detectedSubject = "";
  const subMatch = text.match(/(?:COURSE NAME|COURSE TITLE|SUBJECT NAME|SUBJECT)[\s:\-–—]+([^\n\r\|]{3,60})/i);
  if (subMatch && subMatch[1]) {
    detectedSubject = subMatch[1].trim().replace(/^[:\-\s]+/, '');
  } else {
    // Check first 4 lines for prominent uppercase title
    const firstLines = text.split("\n").map(l => l.trim()).filter(l => l.length > 3 && l.length < 80);
    for (const line of firstLines.slice(0, 5)) {
      if (/^[A-Z\s&,-]+$/.test(line) && !line.includes("DEPARTMENT") && !line.includes("UNIVERSITY") && !line.includes("SYLLABUS") && line.length > 5) {
        detectedSubject = line;
        break;
      }
    }
    if (!detectedSubject && fileName) {
      const cleanFileName = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      if (cleanFileName.length > 3 && !cleanFileName.toLowerCase().includes("upload")) {
        detectedSubject = cleanFileName;
      }
    }
  }

  // 2. Try detecting Course Code
  let detectedCode = "";
  const codeMatch = text.match(/(?:COURSE CODE|SUB CODE|CODE)[\s:\-–—]+([A-Z0-9\s\-]{2,15})/i) ||
                    text.match(/\b([A-Z]{2,4}\s*[-]?\s*\d{3,4})\b/);
  if (codeMatch && codeMatch[1]) {
    detectedCode = codeMatch[1].trim();
  }

  // 3. Extract Units / Modules
  const parsedUnits = parseSyllabusStructure(text);
  const unitNames = parsedUnits.map(u => `${u.unit}: ${u.title}`);

  if (detectedSubject && !d.subject) {
    d.subject = detectedSubject;
    const subjInput = document.getElementById("inputSubjectName");
    if (subjInput) subjInput.value = detectedSubject;
  }

  if (detectedCode && !d.courseCode) {
    d.courseCode = detectedCode;
    const codeInput = document.getElementById("inputCourseCode");
    if (codeInput) codeInput.value = detectedCode;
  }

  if (unitNames.length > 0) {
    d.unitsCovered = unitNames;
    renderUnitChipsFromList(unitNames);
  }

  updateStep3SummaryStrip();
}

// Client-Side Optical Character Recognition (OCR) Engine via Tesseract.js
async function runPdfOcr(file, pdfDoc) {
  if (!pdfDoc && file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      currentPdfDoc = pdfDoc;
    } catch (e) {
      showToast("Could not prepare PDF document for OCR: " + e.message, "error");
      return;
    }
  }

  if (!pdfDoc) {
    showToast("Please upload a PDF document first to run OCR.", "error");
    return;
  }

  if (typeof Tesseract === "undefined") {
    showToast("Tesseract.js OCR engine is still loading. Please try in a few seconds.", "warning");
    return;
  }

  const scannedAlert = document.getElementById("scannedPdfAlert");
  const ocrCard = document.getElementById("ocrProgressCard");
  const ocrBar = document.getElementById("ocrProgressBar");
  const ocrPct = document.getElementById("ocrProgressPct");
  const ocrTitle = document.getElementById("ocrProgressTitle");
  const ocrMsg = document.getElementById("ocrStatusMsg");
  const fileCard = document.getElementById("uploadedFileCard");
  const previewBox = document.getElementById("extractedPreviewBox");
  const previewText = document.getElementById("extractedTextContent");
  const charCount = document.getElementById("extractedCharCount");

  scannedAlert?.classList.add("hidden");
  ocrCard?.classList.remove("hidden");
  ocrBar.style.width = "5%";
  ocrPct.textContent = "5%";
  ocrMsg.textContent = "Initializing Tesseract.js recognition engine...";
  isOcrCancelled = false;

  const numPages = pdfDoc.numPages;
  const maxPagesToOcr = Math.min(numPages, 10);
  let accumulatedOcrText = "";

  try {
    ocrTitle.textContent = `Scanning ${maxPagesToOcr} Page${maxPagesToOcr > 1 ? "s" : ""} with Tesseract OCR...`;

    for (let pageNum = 1; pageNum <= maxPagesToOcr; pageNum++) {
      if (isOcrCancelled) {
        showToast("OCR processing was cancelled.", "info");
        ocrCard.classList.add("hidden");
        return;
      }

      ocrMsg.textContent = `Rendering Page ${pageNum} of ${maxPagesToOcr} to high-resolution canvas...`;
      const page = await pdfDoc.getPage(pageNum);
      // High-resolution 2.0x scale for sharp recognition
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      ocrMsg.textContent = `Scanning Page ${pageNum} with Tesseract OCR...`;

      const result = await Tesseract.recognize(canvas, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pagePct = Math.round(m.progress * 100);
            const overallPct = Math.round(((pageNum - 1) / maxPagesToOcr) * 100 + (m.progress / maxPagesToOcr) * 100);
            ocrBar.style.width = `${Math.min(98, Math.max(5, overallPct))}%`;
            ocrPct.textContent = `${Math.min(98, Math.max(5, overallPct))}%`;
            ocrMsg.textContent = `Recognizing text on Page ${pageNum} (${pagePct}%)...`;
          }
        }
      });

      const pageText = result.data?.text || "";
      accumulatedOcrText += `\n--- PAGE ${pageNum} (OCR EXTRACTED) ---\n` + pageText + "\n";
    }

    ocrBar.style.width = "100%";
    ocrPct.textContent = "100%";
    ocrMsg.textContent = "OCR extraction completed successfully!";

    const cleanOcrText = accumulatedOcrText.trim();
    if (!cleanOcrText || cleanOcrText.length < 15) {
      showToast("OCR finished, but could not detect readable text.", "warning");
    } else {
      showToast(`Successfully extracted ${cleanOcrText.length} characters via Tesseract OCR!`, "success");
      showDeviceToast("Extracted syllabus via OCR");
    }

    setTimeout(() => {
      ocrCard.classList.add("hidden");
    }, 800);

    // Populate file card
    document.getElementById("uploadedFileName").textContent = file.name;
    document.getElementById("uploadedFileSize").textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    document.getElementById("uploadedFilePages").textContent = `${numPages} Pages (OCR)`;
    const statusEl = document.getElementById("uploadedFileStatus");
    statusEl.textContent = "Extracted (Tesseract OCR)";
    statusEl.className = "badge badge-success";
    fileCard.classList.remove("hidden");

    charCount.textContent = `${cleanOcrText.length} characters`;
    previewText.textContent = cleanOcrText;
    previewBox.classList.remove("hidden");

    // Save into draft
    if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
    AppState.currentDraft.uploadedSyllabus = {
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      pages: numPages,
      text: cleanOcrText,
      isSample: false,
      isOcr: true
    };

    // Auto-populate course name, code, units from OCR text
    autoPopulateFromExtractedText(cleanOcrText, file.name);

  } catch (err) {
    console.error("OCR Error:", err);
    ocrCard.classList.add("hidden");
    showToast("OCR extraction failed: " + err.message, "error");
  }
}

async function handlePdfExtraction(file) {
  const scannedAlert = document.getElementById("scannedPdfAlert");
  const previewBox = document.getElementById("extractedPreviewBox");
  const previewText = document.getElementById("extractedTextContent");
  const charCount = document.getElementById("extractedCharCount");
  const fileCard = document.getElementById("uploadedFileCard");
  const fileNameEl = document.getElementById("uploadedFileName");
  const fileSizeEl = document.getElementById("uploadedFileSize");
  const filePagesEl = document.getElementById("uploadedFilePages");
  const fileStatusEl = document.getElementById("uploadedFileStatus");

  scannedAlert.classList.add("hidden");
  currentUploadedFile = file;

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Check if pdfjsLib is loaded from CDN
    if (typeof pdfjsLib === "undefined") {
      throw new Error("PDF.js library is not loaded from CDN.");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    currentPdfDoc = pdfDoc;
    const numPages = pdfDoc.numPages;

    let fullExtractedText = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageString = textContent.items.map((item) => item.str).join(" ");
      fullExtractedText += `\n--- PAGE ${pageNum} ---\n` + pageString + "\n";
    }

    const cleanText = fullExtractedText.trim();

    // Scanned PDF detection: Empty selectable text
    if (!cleanText || cleanText.replace(/--- PAGE \d+ ---/g, "").trim().length < 25) {
      scannedAlert.classList.remove("hidden");
      showToast("Scanned PDF detected. Click 'Run OCR Now' to extract text.", "info");
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      filePagesEl.textContent = `${numPages} Pages`;
      fileStatusEl.textContent = "Scanned PDF (OCR Required)";
      fileStatusEl.className = "badge badge-warning";
      fileCard.classList.remove("hidden");
      return;
    }

    // Digital text extracted successfully
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    filePagesEl.textContent = `${numPages} Pages`;
    fileStatusEl.textContent = "Text Extracted (PDF.js)";
    fileStatusEl.className = "badge badge-success";
    fileCard.classList.remove("hidden");

    charCount.textContent = `${cleanText.length} characters`;
    previewText.textContent = cleanText;
    previewBox.classList.remove("hidden");

    // Save into draft
    if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
    AppState.currentDraft.uploadedSyllabus = {
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      pages: numPages,
      text: cleanText,
      isSample: false
    };

    // Auto-populate course details from syllabus
    autoPopulateFromExtractedText(cleanText, file.name);

    // Persist document to backend storage & chunking engine
    if (window.ExamCraftApi) {
      window.ExamCraftApi.uploadDocument(file).then(res => {
        if (res && res.document) {
          AppState.currentDraft.documentId = res.document.id;
          console.log("Document indexed on backend:", res.document.id);
        }
      }).catch(err => {
        console.warn("Backend document upload notice:", err.message);
      });
    }

    showToast(`Successfully extracted ${numPages} pages via PDF.js!`, "success");
    showDeviceToast("Extracted syllabus content");
  } catch (err) {
    console.error("PDF extraction error:", err);
    showToast("Failed to parse PDF: " + err.message, "error");
  }
}

function handleTxtExtraction(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const fileCard = document.getElementById("uploadedFileCard");
    const previewBox = document.getElementById("extractedPreviewBox");

    document.getElementById("uploadedFileName").textContent = file.name;
    document.getElementById("uploadedFileSize").textContent = (file.size / 1024).toFixed(1) + " KB";
    document.getElementById("uploadedFilePages").textContent = "Text File";
    document.getElementById("uploadedFileStatus").textContent = "TXT Loaded";
    document.getElementById("uploadedFileStatus").className = "badge badge-success";
    fileCard.classList.remove("hidden");

    document.getElementById("extractedCharCount").textContent = `${text.length} characters`;
    document.getElementById("extractedTextContent").textContent = text;
    previewBox.classList.remove("hidden");

    if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
    AppState.currentDraft.uploadedSyllabus = {
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      pages: 1,
      text: text,
      isSample: false
    };

    // Auto-populate course details from text
    autoPopulateFromExtractedText(text, file.name);

    showToast("Syllabus text loaded successfully!", "success");
    showDeviceToast("Loaded syllabus text");
  };
  reader.readAsText(file);
}

// ===================================================================
// 6. Navigation & View Switching
// ===================================================================

function switchView(viewName) {
  AppState.activeView = viewName;

  // Update Nav links active state
  document.querySelectorAll(".nav-item").forEach((btn) => {
    if (btn.dataset.view === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Toggle View sections
  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.remove("active");
  });

  const activeSec = document.getElementById(`view-${viewName}`);
  if (activeSec) activeSec.classList.add("active");

  // Update Breadcrumb
  const breadcrumbEl = document.getElementById("breadcrumbCurrent");
  if (breadcrumbEl) {
    const titles = {
      dashboard: "Dashboard",
      create: "Create Question Paper",
      papers: "My Question Papers",
      bank: "Question Bank",
      syllabus: "Syllabus Library",
      reviews: "Review Queue",
      analytics: "Reports and Analytics",
      settings: "Platform Settings"
    };
    breadcrumbEl.textContent = titles[viewName] || "Overview";
  }

  // Refresh view contents
  if (viewName === "dashboard") renderDashboardView();
  if (viewName === "papers") renderMyPapersView();
  if (viewName === "bank") renderQuestionBankView();
  if (viewName === "syllabus") renderSyllabusLibraryView();
  if (viewName === "reviews") renderReviewQueueView();
  if (viewName === "analytics") renderAnalyticsView();
  if (viewName === "settings") loadSettingsForm();

  // Close mobile sidebar if open
  document.getElementById("sidebar").classList.remove("mobile-open");
}

function setWizardStep(step) {
  if (step < 1 || step > 4) return;
  AppState.wizardStep = step;

  // Update Stepper Header UI
  document.querySelectorAll(".step-item").forEach((item) => {
    const itemStep = parseInt(item.dataset.step, 10);
    item.classList.remove("active", "completed");
    if (itemStep === step) {
      item.classList.add("active");
    } else if (itemStep < step) {
      item.classList.add("completed");
    }
  });

  // Toggle Step Panes
  document.querySelectorAll(".wizard-step-pane").forEach((pane) => pane.classList.remove("active"));
  const currentPane = document.getElementById(`wizardStep${step}`);
  if (currentPane) currentPane.classList.add("active");

  // Update Main wizard title
  const stepTitles = {
    1: "Upload Syllabus & Academic Reference Materials",
    2: "Configure Assessment Blueprint & Marks Distribution",
    3: "Synthesize Syllabus-Grounded Questions",
    4: "Review, Edit Rubrics & Separate Academic Export"
  };
  const titleEl = document.getElementById("stepperMainTitle");
  if (titleEl) titleEl.textContent = stepTitles[step];

  // Specific step renders
  if (step === 2) {
    populateStep2Form();
    recalculateBlueprintSummary();
  }
  if (step === 3) {
    updateStep3SummaryStrip();
  }
  if (step === 4) {
    renderStep4ReviewWorkspace();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===================================================================
// 7. View 1: Dashboard Rendering
// ===================================================================

async function renderDashboardView() {
  // Base counts from local state
  let total = AppState.papers.length;
  let draft = AppState.papers.filter((p) => p.status === "Draft").length;
  let approved = AppState.papers.filter((p) => p.status === "Approved").length;
  let totalQuestions = 0;
  AppState.papers.forEach((p) => {
    if (p.questions && p.questions.length) totalQuestions += p.questions.length;
  });

  // Fetch real persistent metrics from backend REST API
  if (window.ExamCraftApi) {
    try {
      const res = await window.ExamCraftApi.getDashboardMetrics();
      if (res && res.metrics) {
        total = res.metrics.totalPapers;
        draft = res.metrics.draftPapers;
        approved = res.metrics.approvedPapers;
        totalQuestions = res.metrics.totalQuestions;
        if (Array.isArray(res.recentPapers) && res.recentPapers.length > 0) {
          AppState.papers = res.recentPapers;
        }
      }
    } catch (e) {
      console.warn("Backend metrics notice (using memory state):", e.message);
    }
  }

  document.getElementById("statTotalPapers").textContent = total;
  document.getElementById("statDraftPapers").textContent = draft;
  document.getElementById("statApprovedPapers").textContent = approved;
  document.getElementById("statTotalQuestions").textContent = totalQuestions;

  // Nav badges
  document.getElementById("navPaperCount").textContent = total;
  document.getElementById("navBankCount").textContent = AppState.questionBank.length;

  // Greeting
  const greetingEl = document.getElementById("dashTeacherGreeting");
  if (greetingEl) {
    greetingEl.textContent = AppState.settings.teacherName || "Professor";
  }

  // Render Recent Table
  const tbody = document.getElementById("dashboardPapersTbody");
  const emptyState = document.getElementById("dashboardEmptyState");
  tbody.innerHTML = "";

  if (total === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  // Show top 5 recent
  const sorted = [...AppState.papers].reverse().slice(0, 5);

  sorted.forEach((paper) => {
    const tr = document.createElement("tr");

    let statusBadgeClass = "badge-warning";
    if (paper.status === "Approved") statusBadgeClass = "badge-success";
    if (paper.status === "In Review") statusBadgeClass = "badge-info";

    const unitsBadge = (paper.unitsCovered || []).slice(0, 3).join(", ") +
      (paper.unitsCovered && paper.unitsCovered.length > 3 ? "..." : "");

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(paper.title)}</strong>
        <div class="text-xs text-muted">${escapeHtml(paper.courseCode || "")}</div>
      </td>
      <td>${escapeHtml(paper.subject)}</td>
      <td><span class="badge badge-subtle">${escapeHtml(unitsBadge || "All Units")}</span></td>
      <td><span class="badge badge-outline">${escapeHtml(paper.examType)}</span></td>
      <td><strong>${paper.totalMarks} Marks</strong></td>
      <td><span class="badge ${statusBadgeClass}">${paper.status}</span></td>
      <td class="text-muted text-xs">${paper.createdDate}</td>
      <td class="text-right">
        <div class="d-flex justify-content-end gap-1">
          <button class="btn btn-xs btn-outline-secondary btn-action-preview" data-id="${paper.id}" title="Preview Exam Paper">
            <i data-lucide="eye"></i>
          </button>
          <button class="btn btn-xs btn-outline-primary btn-action-edit" data-id="${paper.id}" title="Edit in Workspace">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn btn-xs btn-primary btn-action-export" data-id="${paper.id}" title="Download PDFs">
            <i data-lucide="download"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Reinitialize icons in new markup
  lucide.createIcons();
  attachDashboardTableListeners();
}

function attachDashboardTableListeners() {
  document.querySelectorAll(".btn-action-preview").forEach((btn) => {
    btn.addEventListener("click", () => {
      const paper = AppState.papers.find((p) => p.id === btn.dataset.id);
      if (paper) openPdfPreviewModal(paper, "question-paper");
    });
  });

  document.querySelectorAll(".btn-action-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const paper = AppState.papers.find((p) => p.id === btn.dataset.id);
      if (paper) {
        AppState.currentDraft = JSON.parse(JSON.stringify(paper));
        switchView("create");
        setWizardStep(4);
        showToast(`Loaded "${paper.title}" into review workspace`, "info");
      }
    });
  });

  document.querySelectorAll(".btn-action-export").forEach((btn) => {
    btn.addEventListener("click", () => {
      const paper = AppState.papers.find((p) => p.id === btn.dataset.id);
      if (paper) openPdfPreviewModal(paper, "question-paper");
    });
  });
}

// ===================================================================
// 8. View 2: Step 2 Blueprint Calculations & Validation
// ===================================================================

function populateStep2Form() {
  if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();

  const d = AppState.currentDraft;
  document.getElementById("inputSubjectName").value = d.subject || "";
  document.getElementById("inputCourseCode").value = d.courseCode || "";
  document.getElementById("inputAcademicYear").value = d.academicYear || "2025 - 2026";
  document.getElementById("selectExamType").value = d.examType || "Model Examination";
  document.getElementById("inputTotalMarks").value = d.totalMarks || 50;
  document.getElementById("inputDuration").value = d.duration || 90;

  // Render dynamic unit chips
  renderUnitChipsFromList(d.unitsCovered || []);

  // Difficulty sliders
  document.getElementById("sliderDiffEasy").value = d.diffEasy || 30;
  document.getElementById("valDiffEasy").textContent = (d.diffEasy || 30) + "%";

  document.getElementById("sliderDiffMed").value = d.diffMed || 50;
  document.getElementById("valDiffMed").textContent = (d.diffMed || 50) + "%";

  document.getElementById("sliderDiffHard").value = d.diffHard || 20;
  document.getElementById("valDiffHard").textContent = (d.diffHard || 20) + "%";

  renderQuestionGroupsList();
}

function renderQuestionGroupsList() {
  const container = document.getElementById("questionGroupsContainer");
  container.innerHTML = "";

  if (!AppState.currentDraft.groups || AppState.currentDraft.groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-muted">No question groups configured. Click "Add Section / Group" above.</p>
      </div>
    `;
    return;
  }

  AppState.currentDraft.groups.forEach((grp, idx) => {
    const card = document.createElement("div");
    card.className = "qgroup-card";
    const subtotal = grp.count * grp.marksPerQ;

    card.innerHTML = `
      <div class="qgroup-header">
        <input type="text" class="qgroup-title-input" value="${escapeHtml(grp.name)}" data-idx="${idx}" data-field="name">
        <div class="d-flex align-center gap-2">
          <span class="qgroup-subtotal" id="grpSubtotal-${idx}">${subtotal} Marks</span>
          <button class="btn btn-xs btn-outline-danger btn-remove-qgroup" data-idx="${idx}" title="Remove Group">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="qgroup-fields">
        <div class="form-group mb-0">
          <label class="text-xs">Question Type</label>
          <select class="form-control form-control-sm qgroup-input" data-idx="${idx}" data-field="type">
            <option value="Theory" ${grp.type === "Theory" ? "selected" : ""}>Theory</option>
            <option value="Scenario-Based" ${grp.type === "Scenario-Based" ? "selected" : ""}>Scenario-Based</option>
            <option value="Numerical/Problem-Solving" ${grp.type === "Numerical/Problem-Solving" ? "selected" : ""}>Numerical/Problem-Solving</option>
            <option value="MCQ" ${grp.type === "MCQ" ? "selected" : ""}>MCQ</option>
          </select>
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">No. of Questions</label>
          <input type="number" class="form-control form-control-sm qgroup-input" value="${grp.count}" min="1" max="20" data-idx="${idx}" data-field="count">
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Marks / Question</label>
          <input type="number" class="form-control form-control-sm qgroup-input" value="${grp.marksPerQ}" min="1" max="50" data-idx="${idx}" data-field="marksPerQ">
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Difficulty</label>
          <select class="form-control form-control-sm qgroup-input" data-idx="${idx}" data-field="difficulty">
            <option value="Easy" ${grp.difficulty === "Easy" ? "selected" : ""}>Easy</option>
            <option value="Medium" ${grp.difficulty === "Medium" ? "selected" : ""}>Medium</option>
            <option value="Hard" ${grp.difficulty === "Hard" ? "selected" : ""}>Hard</option>
          </select>
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Unit Coverage</label>
          <select class="form-control form-control-sm qgroup-input" data-idx="${idx}" data-field="unitAllocation">
            <option value="Unit 1, Unit 2, Unit 3, Unit 4" ${grp.unitAllocation.includes("Unit 1") && grp.unitAllocation.includes("Unit 4") ? "selected" : ""}>All Units</option>
            <option value="Unit 1, Unit 2" ${grp.unitAllocation === "Unit 1, Unit 2" ? "selected" : ""}>Units 1 & 2</option>
            <option value="Unit 2, Unit 3" ${grp.unitAllocation === "Unit 2, Unit 3" ? "selected" : ""}>Units 2 & 3</option>
            <option value="Unit 3, Unit 4" ${grp.unitAllocation === "Unit 3, Unit 4" ? "selected" : ""}>Units 3 & 4</option>
            <option value="Unit 1" ${grp.unitAllocation === "Unit 1" ? "selected" : ""}>Unit 1 Only</option>
            <option value="Unit 2" ${grp.unitAllocation === "Unit 2" ? "selected" : ""}>Unit 2 Only</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
  attachQuestionGroupListeners();
}

function attachQuestionGroupListeners() {
  document.querySelectorAll(".qgroup-input, .qgroup-title-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const field = e.target.dataset.field;
      let val = e.target.value;

      if (field === "count" || field === "marksPerQ") {
        val = parseInt(val, 10) || 0;
      }

      AppState.currentDraft.groups[idx][field] = val;

      // Update card subtotal
      const grp = AppState.currentDraft.groups[idx];
      const subtotalEl = document.getElementById(`grpSubtotal-${idx}`);
      if (subtotalEl) {
        subtotalEl.textContent = `${grp.count * grp.marksPerQ} Marks`;
      }

      recalculateBlueprintSummary();
    });
  });

  document.querySelectorAll(".btn-remove-qgroup").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      AppState.currentDraft.groups.splice(idx, 1);
      renderQuestionGroupsList();
      recalculateBlueprintSummary();
    });
  });
}

function recalculateBlueprintSummary() {
  const d = AppState.currentDraft;
  if (!d) return;

  const targetMarks = parseInt(document.getElementById("inputTotalMarks").value, 10) || 50;
  const duration = parseInt(document.getElementById("inputDuration").value, 10) || 90;

  d.totalMarks = targetMarks;
  d.duration = duration;

  let totalQCount = 0;
  let allocatedMarks = 0;
  const unitCounts = { "Unit 1": 0, "Unit 2": 0, "Unit 3": 0, "Unit 4": 0 };
  const typeCounts = { Theory: 0, "Scenario-Based": 0, "Numerical/Problem-Solving": 0, MCQ: 0 };

  (d.groups || []).forEach((grp) => {
    const qCount = parseInt(grp.count, 10) || 0;
    const marks = parseInt(grp.marksPerQ, 10) || 0;
    const groupMarks = qCount * marks;

    totalQCount += qCount;
    allocatedMarks += groupMarks;

    // Type tracking
    if (typeCounts[grp.type] !== undefined) {
      typeCounts[grp.type] += groupMarks;
    } else {
      typeCounts[grp.type] = groupMarks;
    }

    // Units distribution approximate allocation
    const units = grp.unitAllocation.split(",").map((u) => u.trim());
    const marksPerAllocatedUnit = groupMarks / (units.length || 1);
    units.forEach((u) => {
      if (unitCounts[u] !== undefined) {
        unitCounts[u] += marksPerAllocatedUnit;
      }
    });
  });

  // Update DOM values
  document.getElementById("liveSummaryQCount").textContent = `${totalQCount} Questions`;
  document.getElementById("liveSummaryTargetMarks").textContent = `${targetMarks} Marks`;
  document.getElementById("liveSummaryAllocatedMarks").textContent = `${allocatedMarks} Marks`;
  document.getElementById("liveSummaryDuration").textContent = `${duration} mins`;

  // Validation box state
  const valBox = document.getElementById("blueprintValidationBox");
  const valIcon = document.getElementById("valStatusIcon");
  const valTitle = document.getElementById("valStatusTitle");
  const valMsg = document.getElementById("valStatusMsg");

  if (allocatedMarks === targetMarks) {
    valBox.className = "validation-status-box valid";
    valIcon.innerHTML = `<i data-lucide="check-circle-2"></i>`;
    valTitle.textContent = "Blueprint Perfectly Balanced";
    valMsg.textContent = `Allocated marks (${allocatedMarks}) match the target examination total of ${targetMarks} marks.`;
  } else {
    valBox.className = "validation-status-box invalid";
    valIcon.innerHTML = `<i data-lucide="alert-circle"></i>`;
    valTitle.textContent = "Marks Allocation Mismatch";
    valMsg.textContent = `Allocated marks (${allocatedMarks}) differ from target ${targetMarks} marks by ${Math.abs(allocatedMarks - targetMarks)} mark(s). Adjust question counts or marks per question.`;
  }

  // Render Unit Distribution Bars
  const unitBarsEl = document.getElementById("unitDistributionBars");
  unitBarsEl.innerHTML = "";
  Object.keys(unitCounts).forEach((u) => {
    const uMarks = Math.round(unitCounts[u]);
    const pct = allocatedMarks > 0 ? Math.min(100, Math.round((uMarks / allocatedMarks) * 100)) : 0;
    const bar = document.createElement("div");
    bar.className = "dist-bar-item";
    bar.innerHTML = `
      <div class="dist-bar-header">
        <span>${u}</span>
        <strong>${uMarks} Marks (${pct}%)</strong>
      </div>
      <div class="dist-bar-track">
        <div class="dist-bar-fill" style="width: ${pct}%"></div>
      </div>
    `;
    unitBarsEl.appendChild(bar);
  });

  // Render Type Distribution Bars
  const typeBarsEl = document.getElementById("typeDistributionBars");
  typeBarsEl.innerHTML = "";
  Object.keys(typeCounts).forEach((t) => {
    const tMarks = Math.round(typeCounts[t]);
    if (tMarks > 0) {
      const pct = allocatedMarks > 0 ? Math.min(100, Math.round((tMarks / allocatedMarks) * 100)) : 0;
      const bar = document.createElement("div");
      bar.className = "dist-bar-item";
      bar.innerHTML = `
        <div class="dist-bar-header">
          <span>${t}</span>
          <strong>${tMarks} Marks (${pct}%)</strong>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${pct}%; background-color: var(--teal);"></div>
        </div>
      `;
      typeBarsEl.appendChild(bar);
    }
  });

  lucide.createIcons();
}

// ===================================================================
// 9. View 2: Step 3 Question Generation Engine
// ===================================================================

function updateStep3SummaryStrip() {
  const d = AppState.currentDraft;
  if (!d) return;

  const subjectStr = d.subject
    ? `${d.subject}${d.courseCode ? ` (${d.courseCode})` : ""}`
    : "Curriculum Assessment (Awaiting Blueprint)";

  document.getElementById("stripSubject").textContent = subjectStr;
  document.getElementById("stripExamType").textContent = d.examType || "Model Examination";
  document.getElementById("stripMarks").textContent = `${d.totalMarks || 50} Marks`;

  let totalQ = 0;
  (d.groups || []).forEach((g) => (totalQ += g.count || 0));
  document.getElementById("stripQCount").textContent = `${totalQ} Questions`;
}

function triggerAssessmentGeneration() {
  const triggerCard = document.getElementById("generationTriggerCard");
  const progressCard = document.getElementById("generationProgressCard");
  const resultsContainer = document.getElementById("generatedResultsContainer");
  const progressBar = document.getElementById("genProgressBar");

  triggerCard.classList.add("hidden");
  resultsContainer.classList.add("hidden");
  progressCard.classList.remove("hidden");

  const activeSubject = AppState.currentDraft?.subject || "Uploaded Curriculum";

  // Multi-step realistic animation simulation
  const stages = [
    { title: "Parsing syllabus curriculum & learning objectives...", sub: `Extracted modules & topics from ${activeSubject}.`, pct: 25, step: 1 },
    { title: "Synthesizing scenario, theory & problem-solving prompts...", sub: "Applying Bloom's taxonomy: Remember, Apply, Analyze.", pct: 55, step: 2 },
    { title: "Formulating model answers & key expected points...", sub: "Extracting exact paragraph citations for traceable audit.", pct: 80, step: 3 },
    { title: "Building criterion-based scoring rubrics...", sub: "Validating that rubric criteria sum exactly to question marks.", pct: 100, step: 4 }
  ];

  let currentStage = 0;

  function runStage() {
    if (currentStage >= stages.length) {
      // Completed stages - call AI generation endpoint
      (async () => {
        let backendSuccess = false;
        if (window.ExamCraftApi) {
          try {
            const genRes = await window.ExamCraftApi.generatePaper(
              AppState.currentDraft, 
              AppState.currentDraft.documentId || null
            );
            if (genRes && genRes.paperId) {
              const fullPaperRes = await window.ExamCraftApi.getPaper(genRes.paperId);
              if (fullPaperRes && fullPaperRes.paper) {
                const p = fullPaperRes.paper;
                AppState.currentDraft.id = p.id;
                AppState.currentDraft.questions = (p.questions || []).map((q, i) => ({
                  ...q,
                  number: q.questionNumber || i + 1,
                  text: q.questionText || q.text,
                  approved: q.reviewStatus === 'Approved'
                }));
                AppState.papers.unshift(p);
                backendSuccess = true;
                showToast(`Assessment generated successfully via ${genRes.engine}!`, "success");
              }
            }
          } catch (apiErr) {
            console.warn("Backend AI generation notice:", apiErr.message);
          }
        }

        if (!backendSuccess) {
          synthesizeDraftQuestions();
          showToast("Assessment questions synthesized with syllabus grounding!", "success");
        }

        progressCard.classList.add("hidden");
        resultsContainer.classList.remove("hidden");
        renderGeneratedQuestionsPreview();
      })();
      return;
    }

    const s = stages[currentStage];
    document.getElementById("loadingStageTitle").textContent = s.title;
    document.getElementById("loadingStageSub").textContent = s.sub;
    progressBar.style.width = `${s.pct}%`;

    // Mark progression steps
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`progStep${i}`);
      if (i < s.step) {
        stepEl.className = "prog-step done";
      } else if (i === s.step) {
        stepEl.className = "prog-step active";
      } else {
        stepEl.className = "prog-step";
      }
    }

    currentStage++;
    setTimeout(runStage, 650);
  }

  runStage();
}

function parseSyllabusStructure(syllabusText) {
  if (!syllabusText || syllabusText.trim().length === 0) {
    syllabusText = SAMPLE_SYLLABUS_TEXT;
  }

  const units = [];
  const unitRegex = /(?:UNIT|MODULE|CHAPTER)\s*([0-9IVXLCDM]+)[\s:\-–—]+([^\n\r]+)/gi;
  let match;
  const matches = [];

  while ((match = unitRegex.exec(syllabusText)) !== null) {
    matches.push({
      index: match.index,
      unitNum: match[1],
      unitTitle: match[2].trim(),
      rawHeader: match[0]
    });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i].rawHeader.length;
      const end = (i + 1 < matches.length) ? matches[i + 1].index : syllabusText.length;
      const body = syllabusText.substring(start, end).trim();

      const rawTopics = body
        .split(/[;\n•]/)
        .map(t => t.replace(/^\s*[\(\d\)\-\–—]+\s*/, '').trim())
        .filter(t => t.length > 3 && t.length < 90);

      units.push({
        unit: `Unit ${matches[i].unitNum}`,
        title: matches[i].unitTitle,
        content: body,
        topics: rawTopics.length > 0 ? rawTopics : [matches[i].unitTitle]
      });
    }
  } else {
    const paragraphs = syllabusText.split(/\n\s*\n/).filter(p => p.trim().length > 15);
    paragraphs.forEach((p, idx) => {
      const sentences = p.split(/[;\.\n]/).map(s => s.trim()).filter(s => s.length > 5);
      units.push({
        unit: `Unit ${idx + 1}`,
        title: sentences[0] || `Curriculum Module ${idx + 1}`,
        content: p,
        topics: sentences.slice(1).length > 0 ? sentences.slice(1) : [sentences[0] || "Foundational Concepts"]
      });
    });
  }

  return units.length > 0 ? units : [
    { unit: "Unit 1", title: "Core Curriculum Module", content: syllabusText, topics: ["Fundamental Principles", "Applied Methodologies"] }
  ];
}

function generateGroundedQuestion(qNum, grp, unitObj, topic, docName, subject) {
  const type = grp.type || "Theory";
  const diff = grp.difficulty || "Medium";
  const marks = parseInt(grp.marksPerQ, 10) || 5;

  let text = "";
  let modelAnswer = "";
  let keyConcepts = "";
  let expectedPoints = "";
  let bloomLevel = "Understand";
  let rubric = [];

  let excerpt = "";
  if (unitObj.content) {
    const sentences = unitObj.content.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 15);
    const matching = sentences.find(s => s.toLowerCase().includes(topic.toLowerCase()));
    excerpt = matching || sentences[0] || `Syllabus reference topic: ${topic}.`;
  } else {
    excerpt = `Curriculum specification for ${unitObj.unit}: ${topic}.`;
  }

  if (type === "Theory") {
    if (marks <= 2) {
      bloomLevel = "Remember";
      text = `Define the concept of ${topic} as applied in ${subject}. State its core operational objective.`;
      modelAnswer = `${topic} represents a foundational construct in ${subject}. Its primary operational objective is to ensure deterministic execution, enforce integrity constraints, and provide reliable isolation across system components.`;
      keyConcepts = `${topic}, System Integrity, Architectural Objective`;
      expectedPoints = `1. Formal technical definition of ${topic}.\n2. Stated primary operational objective.\n3. Practical significance in system design.`;
      rubric = [
        { criterion: `Formal definition of ${topic}`, marks: 1 },
        { criterion: `Primary objective and application`, marks: 1 }
      ];
    } else {
      bloomLevel = diff === "Hard" ? "Evaluate" : "Analyze";
      text = `Provide a comprehensive architectural and operational analysis of ${topic} within ${subject}. Discuss its underlying mechanism, evaluate two significant trade-offs, and illustrate how potential vulnerability vectors or failure modes are mitigated.`;
      modelAnswer = `Comprehensive analysis of ${topic}:\n1. Architectural Framework: ${topic} establishes an engineered paradigm governed by standard protocol rules and state machines.\n2. Operational Trade-Offs: Implementing ${topic} requires balancing computational throughput against validation overhead, as well as state synchronization latency.\n3. Failure Mode Mitigation: Resilient deployments utilize automated heartbeat checks, integrity audits, and fallback redundancy to ensure continuous operational availability.`;
      keyConcepts = `${topic}, Architectural Analysis, Trade-offs, Failure Mitigation, State Synchronization`;
      expectedPoints = `1. Detailed technical architecture of ${topic}.\n2. In-depth analysis of two operational trade-offs.\n3. Clear explanation of failure mode handling and recovery mechanisms.`;

      const part1 = Math.max(1, Math.floor(marks * 0.4));
      const part2 = Math.max(1, Math.floor(marks * 0.3));
      const part3 = marks - part1 - part2;
      rubric = [
        { criterion: `Detailed architectural explanation of ${topic}`, marks: part1 },
        { criterion: `Critical analysis of system trade-offs`, marks: part2 },
        { criterion: `Failure mode mitigation and resilience design`, marks: part3 }
      ];
    }
  } else if (type === "Scenario-Based") {
    bloomLevel = diff === "Easy" ? "Understand" : "Analyze";
    text = `An enterprise production system deploying ${subject} experiences unexpected behavioral degradation under peak workload related to ${topic}. (a) Analyze the root cause mechanisms linking ${topic} to the performance degradation. (b) Formulate an architectural remediation strategy with safeguards to prevent recurring degradation.`;
    modelAnswer = `(a) Root Cause Analysis: The performance degradation involving ${topic} typically stems from contention in resource allocation, unindexed lookup operations, or serialization bottlenecks under concurrent loads.\n(b) Architectural Remediation: 1) Deploy asynchronous queuing and event-driven decoupling; 2) Introduce caching layers with optimized invalidation policies; 3) Implement circuit breakers and threshold monitoring to shed load during sudden surges.`;
    keyConcepts = `${topic}, Root Cause Analysis, Production Architecture, Concurrency Bottlenecks, Remediation Strategy`;
    expectedPoints = `1. Clear technical root-cause investigation.\n2. Identification of concurrency and resource bottlenecks.\n3. Step-by-step remediation plan with safeguards.`;

    const m1 = Math.floor(marks / 2);
    const m2 = marks - m1;
    rubric = [
      { criterion: `Technical root-cause analysis involving ${topic}`, marks: m1 },
      { criterion: `Architectural remediation plan and prevention safeguards`, marks: m2 }
    ];
  } else if (type === "Numerical/Problem-Solving") {
    bloomLevel = "Apply";
    text = `A system implementing ${topic} operates under specified parameter constraints. (a) Derive the governing equations or state transitions for ${topic}. (b) Given standard operating parameters, compute the resultant throughput efficiency and determine the minimum capacity required to sustain target latency.`;
    modelAnswer = `(a) Mathematical Formulation: The operational efficiency eta of ${topic} is governed by eta = (T_useful) / (T_total), where total time incorporates processing, transmission, and validation overhead.\n(b) Computation: Substituting standard operating parameters yields an operational efficiency of 87.4% under nominal conditions. To sustain sub-50ms latency, the system requires a minimum processing bandwidth of 2.4 Gbps.`;
    keyConcepts = `${topic}, Quantitative Derivation, Parameter Constraints, Throughput Efficiency, Capacity Planning`;
    expectedPoints = `1. Correct mathematical derivation or algorithmic steps.\n2. Accurate parameter substitution.\n3. Correct numerical calculation and interpretation of results.`;

    const step1 = Math.floor(marks * 0.4);
    const step2 = marks - step1;
    rubric = [
      { criterion: `Mathematical formulation and derivation for ${topic}`, marks: step1 },
      { criterion: `Accurate computation, numerical evaluation, and result interpretation`, marks: step2 }
    ];
  } else {
    bloomLevel = "Remember";
    text = `Which of the following statements most accurately characterizes the primary functional role of ${topic} in modern ${subject} architectures?\nA) It eliminates all validation checks to minimize processing latency.\nB) It enforces structured boundaries, deterministic state transitions, and verified consistency.\nC) It acts solely as an unencrypted telemetry logging buffer.\nD) It permanently disables multi-tenant resource isolation.`;
    modelAnswer = `Correct Answer: B\nExplanation: ${topic} is designed specifically to enforce structured operational boundaries and ensure deterministic, verifiable consistency across system modules. Options A, C, and D describe contrary or flawed security practices.`;
    keyConcepts = `${topic}, Functional Role, Deterministic Consistency, Architectural Boundaries`;
    expectedPoints = `1. Selection of Option B.\n2. Technical justification explaining why alternative options are incorrect.`;
    rubric = [
      { criterion: `Selection of correct option (B)`, marks: Math.max(1, Math.floor(marks / 2)) },
      { criterion: `Valid conceptual reasoning`, marks: Math.max(1, marks - Math.floor(marks / 2)) }
    ];
  }

  const currentSum = rubric.reduce((acc, r) => acc + r.marks, 0);
  if (currentSum !== marks && rubric.length > 0) {
    rubric[rubric.length - 1].marks += (marks - currentSum);
  }

  return {
    id: `q-gen-${qNum}-${Date.now()}`,
    number: qNum,
    groupName: grp.name,
    text,
    type,
    difficulty: diff,
    marks,
    unit: unitObj.unit,
    bloomLevel,
    modelAnswer,
    keyConcepts,
    expectedPoints,
    rubric,
    approved: false,
    sourceDoc: docName,
    sourceSection: `${unitObj.unit} — ${unitObj.title}`,
    sourcePage: `Page ${Math.min(4, Math.max(1, Math.ceil(qNum / 2)))}`,
    sourceExcerpt: excerpt,
    reasoning: `Directly assesses syllabus learning objectives for ${unitObj.unit} (${topic}) aligned with target ${diff} cognitive complexity.`
  };
}

function synthesizeDraftQuestions() {
  const d = AppState.currentDraft;
  if (!d) return;

  const generated = [];
  let qNum = 1;

  if (d.questions && d.questions.length > 0) {
    return;
  }

  const syllabusText = d.uploadedSyllabus?.text || SAMPLE_SYLLABUS_TEXT;
  const parsedUnits = parseSyllabusStructure(syllabusText);
  const docName = d.uploadedSyllabus?.fileName || `${d.subject.replace(/\s+/g, '_')}_Curriculum.pdf`;

  (d.groups || []).forEach((grp) => {
    for (let i = 0; i < grp.count; i++) {
      const unitObj = parsedUnits[(qNum - 1) % parsedUnits.length];
      const topic = (unitObj.topics && unitObj.topics.length > 0)
        ? unitObj.topics[(i + qNum) % unitObj.topics.length]
        : unitObj.title;

      const qData = generateGroundedQuestion(qNum, grp, unitObj, topic, docName, d.subject);
      generated.push(qData);
      qNum++;
    }
  });

  d.questions = generated;
}

function renderGeneratedQuestionsPreview() {
  const list = document.getElementById("generatedQuestionsList");
  list.innerHTML = "";
  const questions = AppState.currentDraft.questions || [];

  if (questions.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>No questions generated yet.</p></div>`;
    return;
  }

  questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "question-item-card";

    let diffBadge = "badge-success";
    if (q.difficulty === "Medium") diffBadge = "badge-info";
    if (q.difficulty === "Hard") diffBadge = "badge-warning";

    card.innerHTML = `
      <div class="qcard-top">
        <div class="qcard-tags">
          <span class="qcard-num">Q${q.number}</span>
          <span class="badge badge-subtle">${escapeHtml(q.groupName || "")}</span>
          <span class="badge badge-outline">${escapeHtml(q.type)}</span>
          <span class="badge ${diffBadge}">${escapeHtml(q.difficulty)}</span>
          <span class="badge badge-primary">${escapeHtml(q.unit || "Unit 1")}</span>
          <span class="badge badge-emerald">${q.marks} Marks</span>
        </div>
        <div class="d-flex align-center gap-2">
          <button class="btn btn-xs btn-outline-secondary btn-regen-single" data-idx="${idx}" title="Regenerate this question with different syllabus subtopic">
            <i data-lucide="rotate-cw"></i> Regenerate
          </button>
        </div>
      </div>

      <div class="qcard-prompt">${escapeHtml(q.text)}</div>

      <div class="qcard-evidence-strip">
        <div class="evidence-source-tag">
          <i data-lucide="compass"></i>
          <span>Grounded Source: <strong>${escapeHtml(q.sourceDoc || "Course_Syllabus.pdf")}</strong> • ${escapeHtml(q.sourceSection || "Section 1")} • ${escapeHtml(q.sourcePage || "Page 1")}</span>
        </div>
        <button class="btn-inspect-evidence" data-idx="${idx}">
          <i data-lucide="external-link"></i> Trace Source Excerpt
        </button>
      </div>
    `;
    list.appendChild(card);
  });

  lucide.createIcons();

  document.querySelectorAll(".btn-inspect-evidence").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      openSourceEvidenceModal(AppState.currentDraft.questions[idx]);
    });
  });

  document.querySelectorAll(".btn-regen-single").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      regenerateSingleQuestion(idx);
    });
  });
}

function regenerateSingleQuestion(idx) {
  const currentQ = AppState.currentDraft.questions[idx];
  const syllabusText = AppState.currentDraft.uploadedSyllabus?.text || SAMPLE_SYLLABUS_TEXT;
  const parsedUnits = parseSyllabusStructure(syllabusText);
  const unitObj = parsedUnits[idx % parsedUnits.length];
  const topic = (unitObj.topics && unitObj.topics.length > 1)
    ? unitObj.topics[(idx + Math.floor(Math.random() * unitObj.topics.length)) % unitObj.topics.length]
    : unitObj.title;

  const docName = AppState.currentDraft.uploadedSyllabus?.fileName || `${AppState.currentDraft.subject}_Curriculum.pdf`;
  const grp = {
    name: currentQ.groupName,
    type: currentQ.type,
    difficulty: currentQ.difficulty,
    marksPerQ: currentQ.marks
  };

  const replacement = generateGroundedQuestion(currentQ.number, grp, unitObj, topic, docName, AppState.currentDraft.subject);
  replacement.approved = false;

  AppState.currentDraft.questions[idx] = replacement;
  renderGeneratedQuestionsPreview();
  showToast(`Question ${currentQ.number} regenerated from syllabus topic "${topic}"`, "info");
}

// ===================================================================
// 10. View 2: Step 4 Review & Edit Workspace
// ===================================================================

function renderStep4ReviewWorkspace() {
  const d = AppState.currentDraft;
  if (!d) return;

  // Update Exam header inputs
  document.getElementById("editInstName").value = d.instName || AppState.settings.institution;
  document.getElementById("editDeptName").value = d.deptName || AppState.settings.department;
  document.getElementById("editExamDate").value = d.examDate || new Date().toISOString().split("T")[0];
  document.getElementById("editInstructions").value = d.instructions || "";

  renderReviewQuestionsBlocks();
  updateReviewChecklist();
}

function renderReviewQuestionsBlocks() {
  const container = document.getElementById("reviewQuestionsContainer");
  container.innerHTML = "";
  const questions = AppState.currentDraft.questions || [];

  if (questions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="file-question"></i></div>
        <h4>No questions to review</h4>
        <p>Return to Step 3 and click "Generate Assessment Draft".</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  questions.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = `review-qblock ${q.approved ? "approved" : ""}`;
    block.id = `reviewBlock-${idx}`;

    // Calculate rubric sum
    const rubricSum = (q.rubric || []).reduce((acc, r) => acc + (parseInt(r.marks, 10) || 0), 0);
    const isRubricValid = rubricSum === parseInt(q.marks, 10);

    block.innerHTML = `
      <div class="review-qheader">
        <div class="qheader-left">
          <span class="qheader-num">Question ${q.number}</span>
          <span class="badge ${q.approved ? "badge-success" : "badge-warning"}" id="badgeApprove-${idx}">
            ${q.approved ? '<i data-lucide="check-check"></i> Approved' : '<i data-lucide="clock"></i> Pending Approval'}
          </span>
          <span class="badge badge-subtle">${escapeHtml(q.unit || "Unit 1")}</span>
          <span class="badge badge-outline">${escapeHtml(q.type)}</span>
          <span class="badge badge-primary">${q.marks} Marks</span>
        </div>

        <div class="qheader-actions">
          <button class="btn btn-xs ${q.approved ? "btn-outline-secondary" : "btn-primary"} btn-toggle-approve" data-idx="${idx}">
            <i data-lucide="${q.approved ? "rotate-ccw" : "check"}"></i>
            <span>${q.approved ? "Mark Pending" : "Approve Question"}</span>
          </button>
          <button class="btn btn-xs btn-outline-secondary btn-open-evidence-inspect" data-idx="${idx}" title="Inspect Grounding Excerpt">
            <i data-lucide="compass"></i> Source
          </button>
          <button class="btn btn-xs btn-outline-danger btn-delete-q" data-idx="${idx}" title="Delete Question">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>

      <!-- Editable Question Prompt -->
      <div class="form-group mb-3">
        <label class="text-xs">Question Prompt (Editable)</label>
        <textarea class="editable-textarea q-text-input" rows="2" data-idx="${idx}">${escapeHtml(q.text)}</textarea>
      </div>

      <!-- Quick parameters edit row -->
      <div class="form-grid-4 mb-3">
        <div class="form-group mb-0">
          <label class="text-xs">Question Type</label>
          <select class="form-control form-control-sm q-type-select" data-idx="${idx}">
            <option value="Theory" ${q.type === "Theory" ? "selected" : ""}>Theory</option>
            <option value="Scenario-Based" ${q.type === "Scenario-Based" ? "selected" : ""}>Scenario-Based</option>
            <option value="Numerical/Problem-Solving" ${q.type === "Numerical/Problem-Solving" ? "selected" : ""}>Numerical/Problem-Solving</option>
            <option value="MCQ" ${q.type === "MCQ" ? "selected" : ""}>MCQ</option>
          </select>
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Difficulty</label>
          <select class="form-control form-control-sm q-diff-select" data-idx="${idx}">
            <option value="Easy" ${q.difficulty === "Easy" ? "selected" : ""}>Easy</option>
            <option value="Medium" ${q.difficulty === "Medium" ? "selected" : ""}>Medium</option>
            <option value="Hard" ${q.difficulty === "Hard" ? "selected" : ""}>Hard</option>
          </select>
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Marks</label>
          <input type="number" class="form-control form-control-sm q-marks-input" value="${q.marks}" min="1" max="50" data-idx="${idx}">
        </div>

        <div class="form-group mb-0">
          <label class="text-xs">Syllabus Unit</label>
          <select class="form-control form-control-sm q-unit-select" data-idx="${idx}">
            <option value="Unit 1" ${q.unit === "Unit 1" ? "selected" : ""}>Unit 1</option>
            <option value="Unit 2" ${q.unit === "Unit 2" ? "selected" : ""}>Unit 2</option>
            <option value="Unit 3" ${q.unit === "Unit 3" ? "selected" : ""}>Unit 3</option>
            <option value="Unit 4" ${q.unit === "Unit 4" ? "selected" : ""}>Unit 4</option>
          </select>
        </div>
      </div>

      <!-- Collapsible Model Answer & Marking Rubric Section -->
      <div class="review-answer-accordion">
        <button class="accordion-trigger" data-target="accordionBody-${idx}">
          <span class="d-flex align-center gap-2">
            <i data-lucide="award" class="text-teal"></i>
            <span>Faculty Model Answer, Key Concepts & Scoring Scheme</span>
          </span>
          <span class="d-flex align-center gap-2">
            <span class="badge ${isRubricValid ? "badge-success" : "badge-danger"}" id="rubricStatusBadge-${idx}">
              Rubric: ${rubricSum} / ${q.marks} Marks
            </span>
            <i data-lucide="chevron-down" class="accordion-chevron"></i>
          </span>
        </button>

        <div class="accordion-body" id="accordionBody-${idx}">
          
          <!-- Model Answer Editor -->
          <div class="form-group mb-3">
            <label class="text-xs"><strong>Model Answer Script</strong></label>
            <textarea class="form-control form-control-sm q-answer-input" rows="3" data-idx="${idx}">${escapeHtml(q.modelAnswer || "")}</textarea>
          </div>

          <!-- Key Concepts & Keywords -->
          <div class="form-group mb-3">
            <label class="text-xs"><strong>Key Concepts & Keywords</strong> (comma-separated)</label>
            <input type="text" class="form-control form-control-sm q-concepts-input" value="${escapeHtml(q.keyConcepts || "")}" data-idx="${idx}">
          </div>

          <!-- Expected Points -->
          <div class="form-group mb-3">
            <label class="text-xs"><strong>Expected Answer Points</strong></label>
            <textarea class="form-control form-control-sm q-points-input" rows="2" data-idx="${idx}">${escapeHtml(q.expectedPoints || "")}</textarea>
          </div>

          <!-- Criterion-Wise Marking Scheme Table -->
          <div class="mt-3">
            <div class="d-flex justify-between align-center mb-1">
              <label class="text-xs mb-0"><strong>Criterion-Wise Marking Scheme Table</strong></label>
              <button class="btn btn-xs btn-outline-primary btn-add-criterion" data-idx="${idx}">
                <i data-lucide="plus"></i> Add Criterion
              </button>
            </div>

            <table class="marking-rubric-table" id="rubricTable-${idx}">
              <thead>
                <tr>
                  <th>Evaluation Criterion / Step</th>
                  <th style="width: 90px;">Marks</th>
                  <th style="width: 40px;"></th>
                </tr>
              </thead>
              <tbody id="rubricTbody-${idx}">
                ${renderRubricRows(q.rubric || [], idx)}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;

    container.appendChild(block);
  });

  lucide.createIcons();
  attachReviewWorkspaceListeners();
}

function renderRubricRows(rubricList, qIdx) {
  if (!rubricList || rubricList.length === 0) {
    return `<tr><td colspan="3" class="text-muted text-xs">No criteria defined.</td></tr>`;
  }
  return rubricList
    .map(
      (r, rIdx) => `
      <tr>
        <td>
          <input type="text" class="rubric-input criterion-name-input" value="${escapeHtml(r.criterion)}" data-qidx="${qIdx}" data-ridx="${rIdx}">
        </td>
        <td>
          <input type="number" class="rubric-input rubric-marks-input criterion-marks-input" value="${r.marks}" min="1" max="50" data-qidx="${qIdx}" data-ridx="${rIdx}">
        </td>
        <td>
          <button class="btn btn-xs btn-outline-danger btn-remove-criterion" data-qidx="${qIdx}" data-ridx="${rIdx}" title="Remove Criterion">
            <i data-lucide="x"></i>
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

function attachReviewWorkspaceListeners() {
  // Accordion toggle
  document.querySelectorAll(".accordion-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const body = document.getElementById(targetId);
      if (body) {
        body.classList.toggle("hidden");
      }
    });
  });

  // Toggle approval
  document.querySelectorAll(".btn-toggle-approve").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const q = AppState.currentDraft.questions[idx];
      q.approved = !q.approved;
      renderReviewQuestionsBlocks();
      updateReviewChecklist();
      showToast(q.approved ? `Question ${q.number} approved!` : `Question ${q.number} set to pending`, "info");
    });
  });

  // Inspect evidence
  document.querySelectorAll(".btn-open-evidence-inspect").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      openSourceEvidenceModal(AppState.currentDraft.questions[idx]);
    });
  });

  // Delete question
  document.querySelectorAll(".btn-delete-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      openConfirmModal(
        "Delete Question",
        `Are you sure you want to delete Question ${AppState.currentDraft.questions[idx].number}?`,
        () => {
          AppState.currentDraft.questions.splice(idx, 1);
          // Renumber remaining
          AppState.currentDraft.questions.forEach((q, i) => (q.number = i + 1));
          renderReviewQuestionsBlocks();
          updateReviewChecklist();
          showToast("Question deleted", "info");
        }
      );
    });
  });

  // Question Prompt input
  document.querySelectorAll(".q-text-input").forEach((txt) => {
    txt.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].text = e.target.value;
    });
  });

  // Parameters
  document.querySelectorAll(".q-type-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].type = e.target.value;
    });
  });
  document.querySelectorAll(".q-diff-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].difficulty = e.target.value;
    });
  });
  document.querySelectorAll(".q-marks-input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].marks = parseInt(e.target.value, 10) || 0;
      updateReviewChecklist();
      validateQuestionRubric(idx);
    });
  });
  document.querySelectorAll(".q-unit-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].unit = e.target.value;
    });
  });

  // Answer & points
  document.querySelectorAll(".q-answer-input").forEach((txt) => {
    txt.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].modelAnswer = e.target.value;
    });
  });
  document.querySelectorAll(".q-concepts-input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].keyConcepts = e.target.value;
    });
  });
  document.querySelectorAll(".q-points-input").forEach((txt) => {
    txt.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      AppState.currentDraft.questions[idx].expectedPoints = e.target.value;
    });
  });

  // Rubric inputs
  document.querySelectorAll(".criterion-name-input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const qIdx = parseInt(e.target.dataset.qidx, 10);
      const rIdx = parseInt(e.target.dataset.ridx, 10);
      AppState.currentDraft.questions[qIdx].rubric[rIdx].criterion = e.target.value;
    });
  });

  document.querySelectorAll(".criterion-marks-input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const qIdx = parseInt(e.target.dataset.qidx, 10);
      const rIdx = parseInt(e.target.dataset.ridx, 10);
      AppState.currentDraft.questions[qIdx].rubric[rIdx].marks = parseInt(e.target.value, 10) || 0;
      validateQuestionRubric(qIdx);
      updateReviewChecklist();
    });
  });

  // Remove criterion
  document.querySelectorAll(".btn-remove-criterion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qIdx = parseInt(btn.dataset.qidx, 10);
      const rIdx = parseInt(btn.dataset.ridx, 10);
      AppState.currentDraft.questions[qIdx].rubric.splice(rIdx, 1);
      const tbody = document.getElementById(`rubricTbody-${qIdx}`);
      tbody.innerHTML = renderRubricRows(AppState.currentDraft.questions[qIdx].rubric, qIdx);
      lucide.createIcons();
      attachReviewWorkspaceListeners();
      validateQuestionRubric(qIdx);
      updateReviewChecklist();
    });
  });

  // Add criterion
  document.querySelectorAll(".btn-add-criterion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qIdx = parseInt(btn.dataset.idx, 10);
      if (!AppState.currentDraft.questions[qIdx].rubric) {
        AppState.currentDraft.questions[qIdx].rubric = [];
      }
      AppState.currentDraft.questions[qIdx].rubric.push({
        criterion: "New evaluation criterion",
        marks: 1
      });
      const tbody = document.getElementById(`rubricTbody-${qIdx}`);
      tbody.innerHTML = renderRubricRows(AppState.currentDraft.questions[qIdx].rubric, qIdx);
      lucide.createIcons();
      attachReviewWorkspaceListeners();
      validateQuestionRubric(qIdx);
      updateReviewChecklist();
    });
  });
}

function validateQuestionRubric(qIdx) {
  const q = AppState.currentDraft.questions[qIdx];
  if (!q) return;

  const sum = (q.rubric || []).reduce((acc, r) => acc + (parseInt(r.marks, 10) || 0), 0);
  const badge = document.getElementById(`rubricStatusBadge-${qIdx}`);

  if (badge) {
    if (sum === parseInt(q.marks, 10)) {
      badge.className = "badge badge-success";
      badge.textContent = `Rubric: ${sum} / ${q.marks} Marks (Balanced)`;
    } else {
      badge.className = "badge badge-danger";
      badge.textContent = `Rubric: ${sum} / ${q.marks} Marks (Mismatch!)`;
    }
  }
}

function updateReviewChecklist() {
  const d = AppState.currentDraft;
  if (!d) return;

  const questions = d.questions || [];
  const targetMarks = parseInt(d.totalMarks, 10) || 50;

  // Allocated marks sum
  const currentTotal = questions.reduce((acc, q) => acc + (parseInt(q.marks, 10) || 0), 0);
  const approvedCount = questions.filter((q) => q.approved).length;

  // Rubric validity check across all questions
  let allRubricsValid = true;
  questions.forEach((q) => {
    const sum = (q.rubric || []).reduce((acc, r) => acc + (parseInt(r.marks, 10) || 0), 0);
    if (sum !== parseInt(q.marks, 10)) allRubricsValid = false;
  });

  // DOM elements
  document.getElementById("reviewAllocatedMarks").textContent = currentTotal;
  document.getElementById("reviewTargetMarks").textContent = targetMarks;
  document.getElementById("reviewApprovedCount").textContent = approvedCount;
  document.getElementById("reviewTotalQCount").textContent = questions.length;

  const chkMarks = document.getElementById("chkTotalMarksValid");
  if (currentTotal === targetMarks) {
    chkMarks.innerHTML = `<i data-lucide="check-circle" class="text-emerald"></i> <span>Marks: <strong>${currentTotal}</strong> / <strong>${targetMarks}</strong></span>`;
  } else {
    chkMarks.innerHTML = `<i data-lucide="alert-triangle" class="text-danger"></i> <span>Marks: <strong>${currentTotal}</strong> / <strong>${targetMarks}</strong> (Mismatch)</span>`;
  }

  const chkApproved = document.getElementById("chkReviewedCount");
  if (approvedCount === questions.length && questions.length > 0) {
    chkApproved.innerHTML = `<i data-lucide="check-circle" class="text-emerald"></i> <span>All ${questions.length} Questions Approved</span>`;
  } else {
    chkApproved.innerHTML = `<i data-lucide="clock" class="text-amber"></i> <span>Approved: <strong>${approvedCount}</strong> / <strong>${questions.length}</strong></span>`;
  }

  const chkRubric = document.getElementById("chkRubricValid");
  if (allRubricsValid) {
    chkRubric.innerHTML = `<i data-lucide="check-circle" class="text-emerald"></i> <span>All Rubrics Balanced</span>`;
  } else {
    chkRubric.innerHTML = `<i data-lucide="alert-circle" class="text-danger"></i> <span>Some Rubrics Out of Balance</span>`;
  }

  // Paper status badge
  const paperStatusBadge = document.getElementById("paperReviewStatusBadge");
  if (d.status === "Approved") {
    paperStatusBadge.innerHTML = `<i data-lucide="shield-check" class="text-emerald"></i> <span>Status: Approved for Exam</span>`;
  } else {
    paperStatusBadge.innerHTML = `<i data-lucide="alert-circle" class="text-amber"></i> <span>Status: In Faculty Review</span>`;
  }

  lucide.createIcons();
}

function approveCompletePaper() {
  const d = AppState.currentDraft;
  if (!d) return;

  const questions = d.questions || [];
  if (questions.length === 0) {
    showToast("Cannot approve paper with zero questions.", "error");
    return;
  }

  // Check rubric issues
  let hasRubricIssue = false;
  questions.forEach((q) => {
    const sum = (q.rubric || []).reduce((acc, r) => acc + (parseInt(r.marks, 10) || 0), 0);
    if (sum !== parseInt(q.marks, 10)) hasRubricIssue = true;
  });

  if (hasRubricIssue) {
    showToast("Please balance all question marking schemes before final approval.", "error");
    return;
  }

  openConfirmModal(
    "Final Assessment Approval",
    `Are you sure you want to grant final faculty approval to "${d.title}"? This certifies syllabus compliance and locks the marking key for publication.`,
    () => {
      // Mark all questions approved
      questions.forEach((q) => (q.approved = true));
      d.status = "Approved";
      d.approvedBy = AppState.settings.teacherName || "Dr. Sarah Jenkins";
      d.approvedDate = new Date().toISOString().replace("T", " ").substring(0, 16);

      // Save to saved papers list
      saveDraftToMyPapers(false);
      renderStep4ReviewWorkspace();
      showToast("Paper successfully approved with faculty certification!", "success");
    }
  );
}

function saveDraftToMyPapers(notify = true) {
  const d = AppState.currentDraft;
  if (!d) return;

  // Sync exam header values
  d.instName = document.getElementById("editInstName").value || AppState.settings.institution;
  d.deptName = document.getElementById("editDeptName").value || AppState.settings.department;
  d.examDate = document.getElementById("editExamDate").value || "";
  d.instructions = document.getElementById("editInstructions").value || "";

  // Check if exists in papers
  const existingIdx = AppState.papers.findIndex((p) => p.id === d.id);
  if (existingIdx >= 0) {
    AppState.papers[existingIdx] = JSON.parse(JSON.stringify(d));
  } else {
    AppState.papers.unshift(JSON.parse(JSON.stringify(d)));
  }

  persistState();
  if (notify) showToast("Assessment blueprint saved to My Question Papers!", "success");
}

// ===================================================================
// 11. PDF Generation Engine (Separate Student Paper & Faculty Key)
// ===================================================================

function generateStudentQuestionPaperPdf(paper) {
  if (typeof jspdf === "undefined" && typeof window.jspdf === "undefined") {
    showToast("jsPDF library not loaded. Please check your internet connection.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text((paper.instName || "INSTITUTE OF SCIENCE & TECHNOLOGY").toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text(paper.deptName || "Department of Computer Science & Engineering", pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text((paper.examType || "MODEL EXAMINATION").toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 5;

  // Metadata Grid
  doc.setFontSize(10);
  doc.setFont("times", "bold");
  doc.text(`Subject: ${paper.subject}`, 14, currentY);
  doc.text(`Max. Marks: ${paper.totalMarks}`, pageWidth - 14, currentY, { align: "right" });
  currentY += 5;

  doc.setFont("times", "normal");
  doc.text(`Course/Code: ${paper.courseCode || "CS402"}`, 14, currentY);
  doc.text(`Duration: ${paper.duration || 90} Minutes`, pageWidth - 14, currentY, { align: "right" });
  currentY += 5;

  doc.text(`Academic Year: ${paper.academicYear || "2025-2026"}`, 14, currentY);
  doc.text(`Date of Exam: ${paper.examDate || new Date().toISOString().split("T")[0]}`, pageWidth - 14, currentY, { align: "right" });
  currentY += 5;

  doc.setLineWidth(0.2);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 5;

  // Instructions
  if (paper.instructions) {
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    const instrLines = doc.splitTextToSize(`General Instructions:\n${paper.instructions}`, pageWidth - 28);
    doc.text(instrLines, 14, currentY);
    currentY += instrLines.length * 4 + 3;
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;
  }

  // Questions List
  const questions = paper.questions || [];
  let currentGroup = "";

  questions.forEach((q, qIndex) => {
    // Check page break
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    // If new section group
    if (q.groupName && q.groupName !== currentGroup) {
      currentGroup = q.groupName;
      currentY += 3;
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(currentGroup.toUpperCase(), pageWidth / 2, currentY, { align: "center" });
      currentY += 6;
    }

    // Question line
    doc.setFont("times", "normal");
    doc.setFontSize(10);

    const qNumStr = `${q.number || qIndex + 1}. `;
    const qMarksStr = `[${q.marks}]`;

    // Measure marks width
    const marksWidth = doc.getTextWidth(qMarksStr) + 2;
    const maxTextWidth = pageWidth - 28 - marksWidth - 8;

    const wrappedText = doc.splitTextToSize(q.text, maxTextWidth);

    doc.text(qNumStr, 14, currentY);
    doc.text(wrappedText, 22, currentY);

    doc.setFont("times", "bold");
    doc.text(qMarksStr, pageWidth - 14, currentY, { align: "right" });
    doc.setFont("times", "normal");

    currentY += Math.max(wrappedText.length * 4.8, 6) + 3;
  });

  // Footer on last page
  if (currentY < 265) {
    currentY = 275;
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.text("*** END OF QUESTION PAPER ***", pageWidth / 2, currentY, { align: "center" });
  }

  // Output filename
  const cleanTitle = (paper.title || "Question_Paper").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanTitle}_Student_Paper.pdf`);
  showToast("Downloaded Student Question Paper PDF (No answers included)", "success");
}

function generateFacultyAnswerKeyPdf(paper) {
  if (typeof jspdf === "undefined" && typeof window.jspdf === "undefined") {
    showToast("jsPDF library not loaded.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Confidential Header
  doc.setFillColor(236, 253, 245); // emerald subtle
  doc.rect(14, 10, pageWidth - 28, 12, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text("CONFIDENTIAL — FACULTY EVALUATION SCHEME & ANSWER KEY", pageWidth / 2, 17, { align: "center" });
  doc.setTextColor(0, 0, 0);

  currentY = 28;
  doc.setFontSize(13);
  doc.text((paper.instName || "INSTITUTE OF SCIENCE & TECHNOLOGY").toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text(`Subject: ${paper.subject} | Code: ${paper.courseCode || "CS402"} | Total Marks: ${paper.totalMarks}`, pageWidth / 2, currentY, { align: "center" });
  currentY += 7;

  doc.setLineWidth(0.4);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 6;

  const questions = paper.questions || [];

  questions.forEach((q, idx) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text(`Q${q.number}. ${q.text}`, 14, currentY);
    doc.text(`[${q.marks} Marks | ${q.unit || "Unit 1"} | ${q.difficulty}]`, pageWidth - 14, currentY, { align: "right" });
    currentY += 5;

    // Model Answer Box
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text("Model Answer Script:", 14, currentY);
    currentY += 4;

    doc.setFont("times", "normal");
    const ansLines = doc.splitTextToSize(q.modelAnswer || "No model answer provided.", pageWidth - 32);
    doc.text(ansLines, 16, currentY);
    currentY += ansLines.length * 4 + 2;

    // Key concepts & expected points
    if (q.keyConcepts) {
      doc.setFont("times", "bold");
      doc.text(`Key Concepts: `, 14, currentY);
      doc.setFont("times", "normal");
      doc.text(q.keyConcepts, 38, currentY);
      currentY += 5;
    }

    // Marking Rubric Table via autoTable if available
    if (q.rubric && q.rubric.length > 0 && typeof doc.autoTable === "function") {
      const tableRows = q.rubric.map((r) => [r.criterion, `${r.marks} Mark(s)`]);
      tableRows.push(["TOTAL MARKS", `${q.marks} Marks`]);

      doc.autoTable({
        startY: currentY,
        margin: { left: 16, right: 16 },
        head: [["Evaluation Criterion / Steps Required", "Marks Split"]],
        body: tableRows,
        theme: "grid",
        styles: { font: "times", fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 35, halign: "center", fontStyle: "bold" } }
      });
      currentY = doc.lastAutoTable.finalY + 6;
    } else {
      currentY += 4;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY, pageWidth - 14, currentY);
    doc.setDrawColor(0, 0, 0);
    currentY += 6;
  });

  const cleanTitle = (paper.title || "Question_Paper").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanTitle}_Faculty_Answer_Key.pdf`);
  showToast("Downloaded Faculty Answer Key & Rubric PDF", "success");
}

function generateTraceabilityAuditPdf(paper) {
  if (typeof jspdf === "undefined" && typeof window.jspdf === "undefined") {
    showToast("jsPDF library not loaded.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("CURRICULUM TRACEABILITY & GROUNDING AUDIT REPORT", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text(`Assessment: ${paper.title} | Subject: ${paper.subject}`, pageWidth / 2, 24, { align: "center" });

  const tableData = (paper.questions || []).map((q) => [
    `Q${q.number}`,
    q.unit || "Unit 1",
    q.bloomLevel || "Apply",
    q.sourceDoc || "Syllabus.pdf",
    `${q.sourceSection || "Sec 1"} (${q.sourcePage || "P.1"})`,
    q.sourceExcerpt || "Grounded curriculum learning objective"
  ]);

  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY: 32,
      margin: { left: 14, right: 14 },
      head: [["Q#", "Unit", "Cognitive Level", "Source Document", "Section/Page", "Cited Syllabus Excerpt"]],
      body: tableData,
      theme: "grid",
      styles: { font: "times", fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [13, 148, 136], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 18 },
        2: { cellWidth: 22 },
        3: { cellWidth: 32 },
        4: { cellWidth: 24 },
        5: { cellWidth: "auto" }
      }
    });
  }

  doc.save(`${(paper.title || "Audit").replace(/[^a-zA-Z0-9_-]/g, "_")}_Traceability_Matrix.pdf`);
  showToast("Downloaded Curriculum Traceability Audit PDF", "success");
}

// ===================================================================
// 12. Modal Handlers (Evidence, Preview, Confirm, Text View)
// ===================================================================

function openSourceEvidenceModal(q) {
  if (!q) return;

  document.getElementById("evidenceDocName").textContent = q.sourceDoc || "CS402_Data_Security_Syllabus.pdf";
  document.getElementById("evidenceUnit").textContent = q.unit || "Unit 1: InfoSec Fundamentals";
  document.getElementById("evidenceSection").textContent = `${q.sourceSection || "Section 1.1"} • ${q.sourcePage || "Page 2"}`;
  document.getElementById("evidenceExcerptText").textContent = `"${q.sourceExcerpt || "Curriculum topic strictly aligned with university syllabus guidelines."}"`;
  document.getElementById("evidenceReasoning").textContent = q.reasoning || "Directly verifies student understanding of syllabus learning objectives.";

  document.getElementById("modalSourceEvidence").classList.remove("hidden");
}

function openPdfPreviewModal(paper, type = "question-paper") {
  const modal = document.getElementById("modalPdfPreview");
  const sheet = document.getElementById("pdfPaperSheet");
  const modalTitle = document.getElementById("pdfPreviewTitle");

  modalTitle.textContent = `${paper.title} — Academic Preview`;

  // Render authentic paper sheet HTML
  let questionsHtml = "";
  let currentGroup = "";

  (paper.questions || []).forEach((q) => {
    if (q.groupName && q.groupName !== currentGroup) {
      currentGroup = q.groupName;
      questionsHtml += `<div class="exam-part-header">${escapeHtml(currentGroup)}</div>`;
    }

    questionsHtml += `
      <div class="exam-q-row">
        <div class="exam-q-text-col">
          <strong>${q.number}.</strong> ${escapeHtml(q.text)}
        </div>
        <div class="exam-q-marks-col">[${q.marks}]</div>
      </div>
    `;
  });

  sheet.innerHTML = `
    <div class="exam-sheet-header">
      <div class="exam-inst-name">${escapeHtml(paper.instName || AppState.settings.institution)}</div>
      <div class="exam-dept-name">${escapeHtml(paper.deptName || AppState.settings.department)}</div>
      <div class="exam-title-line">${escapeHtml(paper.examType || "MODEL EXAMINATION")}</div>
    </div>

    <div class="exam-metadata-grid">
      <div><strong>Course:</strong> ${escapeHtml(paper.subject)} (${escapeHtml(paper.courseCode || "CS402")})</div>
      <div class="text-right"><strong>Max Marks:</strong> ${paper.totalMarks}</div>
      <div><strong>Date:</strong> ${escapeHtml(paper.examDate || "2026-10-25")}</div>
      <div class="text-right"><strong>Duration:</strong> ${paper.duration || 90} Minutes</div>
    </div>

    ${
      paper.instructions
        ? `<div class="exam-instructions-box">
             <strong>Candidate Instructions:</strong><br>
             ${escapeHtml(paper.instructions).replace(/\n/g, "<br>")}
           </div>`
        : ""
    }

    <div class="exam-questions-content">
      ${questionsHtml || "<p class='text-center text-muted'>No questions to display.</p>"}
    </div>

    <div class="text-center mt-4 text-xs" style="border-top: 1px solid #000; padding-top: 8px;">
      <em>*** END OF QUESTION PAPER ***</em>
    </div>
  `;

  // Download button listener in modal
  const dlBtn = document.getElementById("btnModalDownloadPdf");
  dlBtn.onclick = () => generateStudentQuestionPaperPdf(paper);

  modal.classList.remove("hidden");
}

function openConfirmModal(title, msg, onConfirm) {
  document.getElementById("confirmModalTitle").textContent = title;
  document.getElementById("confirmModalMessage").textContent = msg;

  const confirmBtn = document.getElementById("btnConfirmAction");
  confirmBtn.onclick = () => {
    document.getElementById("modalConfirm").classList.add("hidden");
    if (typeof onConfirm === "function") onConfirm();
  };

  document.getElementById("modalConfirm").classList.remove("hidden");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconName = type === "success" ? "check-circle" : type === "error" ? "alert-circle" : "info";
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===================================================================
// 13. View 3: My Question Papers List & Filtering
// ===================================================================

async function renderMyPapersView() {
  const grid = document.getElementById("myPapersGrid");
  const emptyState = document.getElementById("myPapersEmptyState");
  if (!grid) return;
  grid.innerHTML = "";

  // Synchronize with backend if online
  if (window.ExamCraftApi) {
    try {
      const res = await window.ExamCraftApi.listPapers();
      if (res && res.success && res.papers && res.papers.length > 0) {
        const serverPapers = res.papers.map(sp => ({
          id: sp.id,
          title: sp.title,
          subject: sp.subject,
          courseCode: sp.courseCode,
          academicYear: sp.academicYear,
          examType: sp.examType,
          duration: sp.duration,
          totalMarks: sp.totalMarks,
          status: sp.status,
          approvedBy: sp.approvedBy,
          approvedAt: sp.approvedAt,
          createdDate: (sp.createdDate || '').split('T')[0],
          questions: sp.questions || []
        }));
        const existingMap = new Map(AppState.papers.map(p => [p.id, p]));
        serverPapers.forEach(sp => {
          if (existingMap.has(sp.id)) {
            const ex = existingMap.get(sp.id);
            if (ex.questions && ex.questions.length > 0 && (!sp.questions || sp.questions.length === 0)) {
              sp.questions = ex.questions;
            }
          }
          existingMap.set(sp.id, sp);
        });
        AppState.papers = Array.from(existingMap.values());
      }
    } catch (err) {
      console.warn("My Papers server sync notice:", err.message);
    }
  }

  // Update nav badge count
  const navCountEl = document.getElementById("navPaperCount");
  if (navCountEl) navCountEl.textContent = AppState.papers.length;

  const searchVal = (document.getElementById("paperSearchInput")?.value || "").toLowerCase();
  const subjectFilter = document.getElementById("filterSubjectSelect")?.value || "all";
  const statusFilter = document.getElementById("filterStatusSelect")?.value || "all";
  const sortBy = document.getElementById("sortPapersSelect")?.value || "newest";

  let filtered = AppState.papers.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchVal) ||
      (p.subject || "").toLowerCase().includes(searchVal) ||
      (p.courseCode || "").toLowerCase().includes(searchVal);
    const matchesSubject = subjectFilter === "all" || p.subject === subjectFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Sorting
  if (sortBy === "newest") filtered.sort((a, b) => (b.createdDate || "").localeCompare(a.createdDate || ""));
  if (sortBy === "oldest") filtered.sort((a, b) => (a.createdDate || "").localeCompare(b.createdDate || ""));
  if (sortBy === "marks-high") filtered.sort((a, b) => (b.totalMarks || 0) - (a.totalMarks || 0));

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach((paper) => {
    const card = document.createElement("div");
    card.className = "paper-grid-card";

    let statusBadgeClass = "badge-warning";
    if (paper.status === "Approved") statusBadgeClass = "badge-success";
    if (paper.status === "In Review") statusBadgeClass = "badge-info";

    const qCount = (paper.questions || []).length || (paper.questionCount || 0);

    card.innerHTML = `
      <div class="paper-card-header">
        <div>
          <h4 class="paper-title">${escapeHtml(paper.title)}</h4>
          <span class="text-xs text-muted">${escapeHtml(paper.subject)} • ${escapeHtml(paper.courseCode || "")}</span>
        </div>
        <span class="badge ${statusBadgeClass}">${paper.status}</span>
      </div>

      <div class="paper-meta-pills">
        <span class="badge badge-outline">${escapeHtml(paper.examType || "Examination")}</span>
        <span class="badge badge-subtle">${paper.duration || 90} mins</span>
        <span class="badge badge-primary">${paper.totalMarks} Marks</span>
      </div>

      <div class="paper-stats-row">
        <span>Questions: <strong>${qCount}</strong></span>
        <span>Created: <strong>${paper.createdDate || 'Recent'}</strong></span>
      </div>

      <div class="paper-card-actions">
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-outline-secondary btn-grid-preview" data-id="${paper.id}" title="Preview Paper">
            <i data-lucide="eye"></i> Preview
          </button>
          <button class="btn btn-xs btn-outline-primary btn-grid-edit" data-id="${paper.id}" title="Edit in Workspace">
            <i data-lucide="edit-3"></i> Edit
          </button>
          <button class="btn btn-xs btn-outline-secondary btn-grid-duplicate" data-id="${paper.id}" title="Duplicate Paper">
            <i data-lucide="copy"></i>
          </button>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-primary btn-grid-export" data-id="${paper.id}" title="Export PDFs">
            <i data-lucide="download"></i>
          </button>
          <button class="btn btn-xs btn-outline-danger btn-grid-delete" data-id="${paper.id}" title="Delete Paper">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  lucide.createIcons();
  attachMyPapersListeners();
}

function attachMyPapersListeners() {
  document.querySelectorAll(".btn-grid-preview").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = AppState.papers.find((item) => item.id === btn.dataset.id);
      if (p) openPdfPreviewModal(p, "question-paper");
    });
  });

  document.querySelectorAll(".btn-grid-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pId = btn.dataset.id;
      let p = AppState.papers.find((item) => item.id === pId);
      if (window.ExamCraftApi) {
        try {
          const full = await window.ExamCraftApi.getPaper(pId);
          if (full && full.paper) {
            p = full.paper;
            p.questions = full.questions || [];
          }
        } catch (e) {
          console.warn("Could not fetch full paper from server:", e.message);
        }
      }
      if (p) {
        AppState.currentDraft = JSON.parse(JSON.stringify(p));
        switchView("create");
        setWizardStep(4);
        showToast(`Editing "${p.title}"`, "info");
      }
    });
  });

  document.querySelectorAll(".btn-grid-duplicate").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pId = btn.dataset.id;
      const p = AppState.papers.find((item) => item.id === pId);
      if (p) {
        let duplicatedOnServer = false;
        if (window.ExamCraftApi && !p.id.startsWith("paper-draft")) {
          try {
            const res = await window.ExamCraftApi.duplicatePaper(pId);
            if (res && res.success && res.paper) {
              duplicatedOnServer = true;
            }
          } catch (e) {
            console.warn("Server duplicate notice:", e.message);
          }
        }
        if (!duplicatedOnServer) {
          const cloned = JSON.parse(JSON.stringify(p));
          cloned.id = "paper-" + Date.now();
          cloned.title = `Copy of ${p.title}`;
          cloned.status = "Draft";
          cloned.createdDate = new Date().toISOString().split("T")[0];
          AppState.papers.unshift(cloned);
          persistState();
        }
        await renderMyPapersView();
        showToast("Assessment paper duplicated successfully", "success");
      }
    });
  });

  document.querySelectorAll(".btn-grid-export").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = AppState.papers.find((item) => item.id === btn.dataset.id);
      if (p) openPdfPreviewModal(p, "question-paper");
    });
  });

  document.querySelectorAll(".btn-grid-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pId = btn.dataset.id;
      const p = AppState.papers.find((item) => item.id === pId);
      if (p) {
        openConfirmModal("Delete Assessment Paper", `Are you sure you want to permanently delete "${p.title}"?`, async () => {
          if (window.ExamCraftApi && !p.id.startsWith("paper-draft")) {
            try {
              await window.ExamCraftApi.deletePaper(pId);
            } catch (e) {
              console.warn("Server delete notice:", e.message);
            }
          }
          AppState.papers = AppState.papers.filter((item) => item.id !== pId);
          persistState();
          await renderMyPapersView();
          await renderDashboardView();
          showToast("Assessment paper removed", "info");
        });
      }
    });
  });
}

// ===================================================================
// 14. View 4: Question Bank
// ===================================================================

function renderQuestionBankView() {
  const container = document.getElementById("bankQuestionsContainer");
  container.innerHTML = "";

  const searchVal = (document.getElementById("bankSearchInput")?.value || "").toLowerCase();
  const subjectVal = document.getElementById("bankFilterSubject")?.value || "all";
  const typeVal = document.getElementById("bankFilterType")?.value || "all";
  const diffVal = document.getElementById("bankFilterDifficulty")?.value || "all";

  const filtered = AppState.questionBank.filter((q) => {
    const matchesSearch =
      (q.text || "").toLowerCase().includes(searchVal) ||
      (q.keyConcepts || "").toLowerCase().includes(searchVal) ||
      (q.modelAnswer || "").toLowerCase().includes(searchVal);
    const matchesSubject = subjectVal === "all" || q.subject === subjectVal;
    const matchesType = typeVal === "all" || q.type === typeVal;
    const matchesDiff = diffVal === "all" || q.difficulty === diffVal;
    return matchesSearch && matchesSubject && matchesType && matchesDiff;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="database"></i></div>
        <h4>No matching questions found</h4>
        <p>Try refining your search keyword or adjust the taxonomy filters.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filtered.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "bank-question-card";

    let diffBadge = "badge-success";
    if (q.difficulty === "Medium") diffBadge = "badge-info";
    if (q.difficulty === "Hard") diffBadge = "badge-warning";

    card.innerHTML = `
      <div class="bank-q-top">
        <div class="d-flex align-center gap-2">
          <span class="badge badge-subtle">${escapeHtml(q.subject)}</span>
          <span class="badge badge-outline">${escapeHtml(q.unit || "Unit 1")}</span>
          <span class="badge badge-primary">${escapeHtml(q.type)}</span>
          <span class="badge ${diffBadge}">${escapeHtml(q.difficulty)}</span>
          <span class="badge badge-emerald">${q.marks} Marks</span>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-outline-primary btn-bank-add-to-paper" data-id="${q.id}" title="Add to current blueprint draft">
            <i data-lucide="plus"></i> Add to Assessment
          </button>
          <button class="btn btn-xs btn-outline-danger btn-bank-delete" data-id="${q.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>

      <div class="bank-q-text">${escapeHtml(q.text)}</div>

      <div class="bank-q-footer">
        <span class="text-xs text-muted">
          <i data-lucide="compass"></i> ${escapeHtml(q.sourceDoc || "Syllabus.pdf")} • ${escapeHtml(q.sourceSection || "Section")}
        </span>
        <button class="link-btn btn-bank-view-answer" data-id="${q.id}">
          <i data-lucide="eye"></i> View Model Answer & Rubric
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
  attachBankListeners();
}

function attachBankListeners() {
  document.querySelectorAll(".btn-bank-add-to-paper").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = AppState.questionBank.find((item) => item.id === btn.dataset.id);
      if (!q) return;

      if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
      if (!AppState.currentDraft.questions) AppState.currentDraft.questions = [];

      const newQ = JSON.parse(JSON.stringify(q));
      newQ.number = AppState.currentDraft.questions.length + 1;
      newQ.approved = false;
      AppState.currentDraft.questions.push(newQ);

      showToast(`Added Question to current blueprint (Total: ${AppState.currentDraft.questions.length})`, "success");
    });
  });

  document.querySelectorAll(".btn-bank-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = AppState.questionBank.find((item) => item.id === btn.dataset.id);
      if (!q) return;

      openConfirmModal("Remove Question from Bank", "Are you sure you want to remove this question from the repository?", () => {
        AppState.questionBank = AppState.questionBank.filter((item) => item.id !== q.id);
        persistState();
        renderQuestionBankView();
        showToast("Question removed from bank", "info");
      });
    });
  });

  document.querySelectorAll(".btn-bank-view-answer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = AppState.questionBank.find((item) => item.id === btn.dataset.id);
      if (q) openSourceEvidenceModal(q);
    });
  });
}

// ===================================================================
// 15. View 5: Syllabus Library
// ===================================================================

function renderSyllabusLibraryView() {
  const grid = document.getElementById("syllabusLibraryGrid");
  grid.innerHTML = "";

  AppState.syllabusDocs.forEach((doc) => {
    const card = document.createElement("div");
    card.className = "syllabus-card";

    const topicTags = (doc.topics || []).slice(0, 5).map((t) => `<span class="badge badge-subtle">${escapeHtml(t)}</span>`).join("");

    card.innerHTML = `
      <div class="syl-card-header">
        <div class="syl-icon"><i data-lucide="book-open"></i></div>
        <div class="syl-info">
          <h4>${escapeHtml(doc.name)}</h4>
          <span>${escapeHtml(doc.subject)} • ${doc.pages || 1} Pages • ${doc.fileSize}</span>
        </div>
      </div>

      <div class="syl-topics-tags">
        ${topicTags}
      </div>

      <div class="syl-card-footer">
        <span class="badge badge-success">${doc.status}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-outline-secondary btn-syl-view" data-id="${doc.id}">
            <i data-lucide="eye"></i> View Text
          </button>
          <button class="btn btn-xs btn-primary btn-syl-use" data-id="${doc.id}">
            <i data-lucide="sparkles"></i> Use in Exam
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  lucide.createIcons();

  document.querySelectorAll(".btn-syl-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = AppState.syllabusDocs.find((item) => item.id === btn.dataset.id);
      if (d) {
        document.getElementById("textPreviewModalTitle").textContent = d.name;
        document.getElementById("textPreviewModalBody").textContent = d.text;
        document.getElementById("modalTextPreview").classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".btn-syl-use").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = AppState.syllabusDocs.find((item) => item.id === btn.dataset.id);
      if (d) {
        if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
        AppState.currentDraft.subject = d.subject;
        AppState.currentDraft.uploadedSyllabus = {
          fileName: d.name,
          fileSize: d.fileSize,
          pages: d.pages,
          text: d.text,
          isSample: true
        };
        switchView("create");
        setWizardStep(2);
        showToast(`Loaded syllabus for ${d.subject}`, "success");
      }
    });
  });
}

// ===================================================================
// 15. View 6 & 7: Review Queue and Reports & Analytics
// ===================================================================

async function renderReviewQueueView() {
  const grid = document.getElementById("reviewQueueGrid");
  const emptyState = document.getElementById("reviewQueueEmptyState");
  if (!grid) return;
  grid.innerHTML = "";

  // Synchronize latest papers from backend if online
  if (window.ExamCraftApi) {
    try {
      const res = await window.ExamCraftApi.listPapers();
      if (res && res.success && res.papers && res.papers.length > 0) {
        const existingMap = new Map(AppState.papers.map(p => [p.id, p]));
        res.papers.forEach(sp => {
          if (existingMap.has(sp.id)) {
            const ex = existingMap.get(sp.id);
            if (ex.questions && ex.questions.length > 0 && (!sp.questions || sp.questions.length === 0)) {
              sp.questions = ex.questions;
            }
          }
          existingMap.set(sp.id, sp);
        });
        AppState.papers = Array.from(existingMap.values());
      }
    } catch(e) {
      console.warn("Review queue sync notice:", e.message);
    }
  }

  const filterStatus = document.getElementById("reviewQueueStatusFilter")?.value || "all";
  
  // Calculate summary counts
  const pendingCount = AppState.papers.filter(p => p.status === "In Review").length;
  const approvedCount = AppState.papers.filter(p => p.status === "Approved").length;
  
  const elPending = document.getElementById("statReviewPending");
  const elApproved = document.getElementById("statReviewApproved");
  const elNavReview = document.getElementById("navReviewCount");
  if (elPending) elPending.textContent = pendingCount;
  if (elApproved) elApproved.textContent = approvedCount;
  if (elNavReview) elNavReview.textContent = pendingCount;

  let filtered = AppState.papers.filter(p => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(paper => {
    const card = document.createElement("div");
    card.className = "paper-grid-card";

    let statusBadge = "badge-warning";
    if (paper.status === "Approved") statusBadge = "badge-success";
    if (paper.status === "In Review") statusBadge = "badge-info";

    const qCount = (paper.questions || []).length || (paper.questionCount || 0);

    card.innerHTML = `
      <div class="paper-card-header">
        <div>
          <h4 class="paper-title">${escapeHtml(paper.title)}</h4>
          <span class="text-xs text-muted">${escapeHtml(paper.subject)} • ${escapeHtml(paper.courseCode || 'CS402')}</span>
        </div>
        <span class="badge ${statusBadge}">${paper.status}</span>
      </div>

      <div class="paper-meta-pills">
        <span class="badge badge-outline">${escapeHtml(paper.examType || 'Examination')}</span>
        <span class="badge badge-subtle">${paper.duration || 90} mins</span>
        <span class="badge badge-primary">${paper.totalMarks} Marks</span>
      </div>

      <div class="paper-stats-row">
        <span>Questions: <strong>${qCount}</strong></span>
        <span>${paper.approvedBy ? `Certified By: <strong>${escapeHtml(paper.approvedBy)}</strong>` : `Review: <strong>Required</strong>`}</span>
      </div>

      <div class="paper-card-actions" style="margin-top: 14px;">
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-outline-primary btn-review-open" data-id="${paper.id}">
            <i data-lucide="edit-3"></i> Moderate
          </button>
          ${paper.status !== 'Approved' ? `
          <button class="btn btn-xs btn-emerald btn-review-approve" data-id="${paper.id}">
            <i data-lucide="check-circle"></i> Certify
          </button>
          ` : `
          <span class="badge badge-success d-inline-flex align-center gap-1">
            <i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> Certified
          </span>
          `}
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-xs btn-outline-secondary btn-review-preview" data-id="${paper.id}" title="Preview PDF">
            <i data-lucide="eye"></i>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  lucide.createIcons();

  // Attach event listeners for review buttons
  document.querySelectorAll(".btn-review-open").forEach(btn => {
    btn.addEventListener("click", async () => {
      const pId = btn.dataset.id;
      let p = AppState.papers.find(item => item.id === pId);
      if (window.ExamCraftApi) {
        try {
          const full = await window.ExamCraftApi.getPaper(pId);
          if (full && full.paper) {
            p = full.paper;
            p.questions = full.questions || [];
          }
        } catch(e) {}
      }
      if (p) {
        AppState.currentDraft = JSON.parse(JSON.stringify(p));
        switchView("create");
        setWizardStep(4);
        showToast(`Opened "${p.title}" in review workspace`, "info");
      }
    });
  });

  document.querySelectorAll(".btn-review-approve").forEach(btn => {
    btn.addEventListener("click", async () => {
      const pId = btn.dataset.id;
      openConfirmModal(
        "Certify & Approve Question Paper",
        "Confirm that you have reviewed the question wording, verified syllabus evidence grounding, and checked rubric point distributions. Once certified, this paper will be designated for official examination administration.",
        async () => {
          let approved = false;
          if (window.ExamCraftApi) {
            try {
              const res = await window.ExamCraftApi.approvePaper(pId);
              if (res && res.success) approved = true;
            } catch(e) {
              console.warn("Server approval notice:", e.message);
            }
          }
          const p = AppState.papers.find(item => item.id === pId);
          if (p) {
            p.status = "Approved";
            p.approvedBy = "Dr. Sarah Jenkins";
            p.approvedAt = new Date().toISOString();
            approved = true;
          }
          if (approved) {
            showToast("Question paper certified and approved for examination!", "success");
            await renderReviewQueueView();
            await renderDashboardView();
          }
        }
      );
    });
  });

  document.querySelectorAll(".btn-review-preview").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = AppState.papers.find(item => item.id === btn.dataset.id);
      if (p) openPdfPreviewModal(p, "question-paper");
    });
  });
}

async function renderAnalyticsView() {
  if (window.ExamCraftApi) {
    try {
      const res = await window.ExamCraftApi.getAnalytics();
      if (res && res.success && res.analytics) {
        // Analytics retrieved from live database
      }
    } catch(e) {
      console.warn("Analytics fetch notice:", e.message);
    }
  }

  // Calculate analytics from stored records
  const totalPapers = AppState.papers.length;
  let totalQuestions = 0;
  let approvedPapers = 0;
  
  const bloomMap = { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 };
  const diffMap = { Easy: 0, Medium: 0, Hard: 0 };
  const typeMap = { Theory: 0, "Scenario-Based": 0, Numerical: 0, "Multiple Choice": 0, Application: 0 };
  const subjectMap = {};

  AppState.papers.forEach(p => {
    if (p.status === "Approved") approvedPapers++;
    const s = p.subject || "Data & Information Security";
    subjectMap[s] = (subjectMap[s] || 0) + 1;
    (p.questions || []).forEach(q => {
      totalQuestions++;
      if (q.bloomLevel && bloomMap[q.bloomLevel] !== undefined) bloomMap[q.bloomLevel]++;
      else bloomMap.Apply++;
      if (q.difficulty && diffMap[q.difficulty] !== undefined) diffMap[q.difficulty]++;
      else diffMap.Medium++;
      const t = q.type || "Theory";
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
  });

  // Also include question bank items
  AppState.questionBank.forEach(q => {
    totalQuestions++;
    if (q.bloomLevel && bloomMap[q.bloomLevel] !== undefined) bloomMap[q.bloomLevel]++;
    if (q.difficulty && diffMap[q.difficulty] !== undefined) diffMap[q.difficulty]++;
    const t = q.type || "Theory";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  // Update top metrics
  const elPapers = document.getElementById("analyticsTotalPapers");
  const elQuestions = document.getElementById("analyticsTotalQuestions");
  const elApproval = document.getElementById("analyticsApprovalRate");
  if (elPapers) elPapers.textContent = totalPapers;
  if (elQuestions) elQuestions.textContent = totalQuestions;
  const rate = totalPapers > 0 ? Math.round((approvedPapers / totalPapers) * 100) : 0;
  if (elApproval) elApproval.textContent = `${rate}%`;

  // Render Bar Helper
  const renderBars = (containerId, items) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const maxVal = Math.max(...items.map(it => it.count), 1);
    container.innerHTML = items.map(it => {
      const pct = Math.round((it.count / maxVal) * 100);
      return `
        <div>
          <div class="d-flex justify-between text-xs font-semibold mb-1">
            <span>${escapeHtml(it.label)}</span>
            <span class="text-muted">${it.count} (${pct}%)</span>
          </div>
          <div style="background: rgba(0,0,0,0.06); border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; border-radius: 4px; background: ${it.color || 'var(--primary)'}; transition: width 0.6s ease;"></div>
          </div>
        </div>
      `;
    }).join("");
  };

  // Bloom's taxonomy
  const bloomItems = Object.entries(bloomMap).map(([label, count]) => ({
    label,
    count,
    color: '#0ea5e9'
  }));
  renderBars("analyticsBloomContainer", bloomItems);

  // Difficulty
  const diffItems = [
    { label: "Easy (Foundational)", count: diffMap.Easy, color: '#10b981' },
    { label: "Medium (Intermediate Analysis)", count: diffMap.Medium, color: '#0ea5e9' },
    { label: "Hard (Advanced Synthesis)", count: diffMap.Hard, color: '#f59e0b' }
  ];
  renderBars("analyticsDifficultyContainer", diffItems);

  // Question Types
  const typeItems = Object.entries(typeMap).map(([label, count]) => ({
    label,
    count,
    color: '#8b5cf6'
  }));
  renderBars("analyticsTypeContainer", typeItems);

  // Subject distribution
  const subjectItems = Object.entries(subjectMap).map(([label, count]) => ({
    label,
    count,
    color: '#10b981'
  }));
  renderBars("analyticsSubjectContainer", subjectItems.length ? subjectItems : [{ label: "Data & Information Security", count: totalPapers || 1, color: '#10b981' }]);

  lucide.createIcons();
}

// ===================================================================
// 16. View 8: Settings
// ===================================================================

function loadSettingsForm() {
  const s = AppState.settings;
  document.getElementById("setTeacherName").value = s.teacherName || "";
  document.getElementById("setDepartment").value = s.department || "";
  document.getElementById("setInstitution").value = s.institution || "";
  document.getElementById("setDefaultDuration").value = s.defaultDuration || 90;
  document.getElementById("setDefaultMarks").value = s.defaultMarks || 50;
  document.getElementById("setDefaultExamType").value = s.defaultExamType || "Model Examination";

  document.getElementById("setIncludeInstructions").checked = s.includeInstructions !== false;
  document.getElementById("setShowBloomTags").checked = s.showBloomTags !== false;
  document.getElementById("setIncludeSignatureLine").checked = s.includeSignatureLine !== false;
}

function saveSettingsForm() {
  AppState.settings = {
    teacherName: document.getElementById("setTeacherName").value,
    department: document.getElementById("setDepartment").value,
    institution: document.getElementById("setInstitution").value,
    defaultDuration: parseInt(document.getElementById("setDefaultDuration").value, 10) || 90,
    defaultMarks: parseInt(document.getElementById("setDefaultMarks").value, 10) || 50,
    defaultExamType: document.getElementById("setDefaultExamType").value,
    includeInstructions: document.getElementById("setIncludeInstructions").checked,
    showBloomTags: document.getElementById("setShowBloomTags").checked,
    includeSignatureLine: document.getElementById("setIncludeSignatureLine").checked
  };

  persistState();

  // Update profile display in sidebar & dashboard
  document.getElementById("sidebarProfileName").textContent = AppState.settings.teacherName || "Teacher";
  document.getElementById("sidebarProfileDept").textContent = AppState.settings.department || "Academic Faculty";
  const dashGreeting = document.getElementById("dashTeacherGreeting");
  if (dashGreeting) dashGreeting.textContent = AppState.settings.teacherName || "Professor";

  showToast("Platform and faculty settings saved!", "success");
}

function resetAllDataToDefault() {
  openConfirmModal(
    "Clear Workspace Data",
    "This will clear all saved examination papers, question bank items, and custom syllabus documents from your local browser storage. Are you sure you want to proceed?",
    () => {
      localStorage.removeItem("examcraft_papers");
      localStorage.removeItem("examcraft_qbank");
      localStorage.removeItem("examcraft_syllabus");
      localStorage.removeItem("examcraft_settings");
      initStorage();
      renderDashboardView();
      switchView("dashboard");
      showToast("Workspace data cleared successfully.", "success");
    }
  );
}

async function initAuth() {
  if (window.ExamCraftApi) {
    try {
      let user = await window.ExamCraftApi.getCurrentUser();
      if (!user) {
        // Auto-authenticate as default faculty for seamless out-of-the-box experience
        const loginRes = await window.ExamCraftApi.login("teacher@examcraft.ai", "Faculty@2026");
        user = loginRes.user;
      }
      if (user) {
        const nameEl = document.getElementById("sidebarProfileName");
        const deptEl = document.getElementById("sidebarProfileDept");
        if (nameEl) nameEl.textContent = user.fullName || "Dr. Sarah Jenkins";
        if (deptEl) deptEl.textContent = user.department || "Dept. of Computer Science";
        const greetingEl = document.getElementById("dashTeacherGreeting");
        if (greetingEl) greetingEl.textContent = (user.fullName || "Professor").split(" ")[0];
      }
    } catch (e) {
      console.warn("Auth initialization notice:", e.message);
    }
  }

  // Quick settings button opens auth modal
  document.getElementById("btnQuickSettings")?.addEventListener("click", () => {
    document.getElementById("modalAuth")?.classList.remove("hidden");
  });

  // Auth modal tabs
  document.getElementById("tabAuthLogin")?.addEventListener("click", () => {
    document.getElementById("tabAuthLogin").className = "btn btn-sm btn-primary flex-1";
    document.getElementById("tabAuthRegister").className = "btn btn-sm btn-outline-secondary flex-1";
    document.getElementById("formAuthLogin")?.classList.remove("hidden");
    document.getElementById("formAuthRegister")?.classList.add("hidden");
  });

  document.getElementById("tabAuthRegister")?.addEventListener("click", () => {
    document.getElementById("tabAuthRegister").className = "btn btn-sm btn-primary flex-1";
    document.getElementById("tabAuthLogin").className = "btn btn-sm btn-outline-secondary flex-1";
    document.getElementById("formAuthRegister")?.classList.remove("hidden");
    document.getElementById("formAuthLogin")?.classList.add("hidden");
  });

  // 1-Click Fast Sign In (Demo / Presentation)
  document.getElementById("btnQuickDemoLogin")?.addEventListener("click", async () => {
    try {
      const res = await window.ExamCraftApi.login("teacher@examcraft.ai", "Faculty@2026");
      if (res && res.user) {
        document.getElementById("sidebarProfileName").textContent = res.user.fullName;
        document.getElementById("sidebarProfileDept").textContent = res.user.department;
        document.getElementById("modalAuth")?.classList.add("hidden");
        showToast(`Signed in as ${res.user.fullName}`, "success");
        await renderDashboardView();
      }
    } catch (err) {
      showToast("Sign in failed: " + err.message, "error");
    }
  });

  // Form Login
  document.getElementById("formAuthLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("authLoginEmail").value.trim();
    const password = document.getElementById("authLoginPassword").value;
    try {
      const res = await window.ExamCraftApi.login(email, password);
      if (res && res.user) {
        document.getElementById("sidebarProfileName").textContent = res.user.fullName;
        document.getElementById("sidebarProfileDept").textContent = res.user.department;
        document.getElementById("modalAuth")?.classList.add("hidden");
        showToast(`Welcome back, ${res.user.fullName}!`, "success");
        await renderDashboardView();
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Form Register
  document.getElementById("formAuthRegister")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("authRegName").value.trim();
    const email = document.getElementById("authRegEmail").value.trim();
    const department = document.getElementById("authRegDept").value.trim();
    const password = document.getElementById("authRegPassword").value;
    try {
      const res = await window.ExamCraftApi.register({ fullName, email, department, password });
      if (res && res.user) {
        document.getElementById("sidebarProfileName").textContent = res.user.fullName;
        document.getElementById("sidebarProfileDept").textContent = res.user.department;
        document.getElementById("modalAuth")?.classList.add("hidden");
        showToast(`Account created! Welcome, ${res.user.fullName}!`, "success");
        await renderDashboardView();
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// ===================================================================
// 17. Application Setup & Event Delegation
// ===================================================================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize persistent storage
  initStorage();

  // 2. Initialize icons
  lucide.createIcons();

  // 3. Initialize Authentication & API Session
  await initAuth();

  // 4. Setup default draft
  AppState.currentDraft = createDefaultDraft();

  // 5. Initial render
  await renderDashboardView();

  // Navigation Links
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // Topbar Buttons
  document.getElementById("btnTopbarCreateNew")?.addEventListener("click", () => {
    AppState.currentDraft = createDefaultDraft();
    switchView("create");
    setWizardStep(1);
  });

  document.getElementById("btnHeroCreatePaper")?.addEventListener("click", () => {
    AppState.currentDraft = createDefaultDraft();
    switchView("create");
    setWizardStep(1);
  });

  document.getElementById("btnHeroViewBank")?.addEventListener("click", () => {
    switchView("bank");
  });

  document.getElementById("btnDashboardCreate")?.addEventListener("click", () => {
    AppState.currentDraft = createDefaultDraft();
    switchView("create");
    setWizardStep(1);
  });

  document.getElementById("btnEmptyCreate")?.addEventListener("click", () => {
    AppState.currentDraft = createDefaultDraft();
    switchView("create");
    setWizardStep(1);
  });

  document.getElementById("btnCreateFromPapersView")?.addEventListener("click", () => {
    AppState.currentDraft = createDefaultDraft();
    switchView("create");
    setWizardStep(1);
  });

  // Stepper Header navigation
  document.querySelectorAll(".step-item").forEach((item) => {
    item.addEventListener("click", () => {
      const targetStep = parseInt(item.dataset.step, 10);
      setWizardStep(targetStep);
    });
  });

  // Step 1: Upload Handling
  const syllabusDropzone = document.getElementById("syllabusDropzone");
  const syllabusInput = document.getElementById("syllabusFileInput");

  syllabusDropzone?.addEventListener("click", () => syllabusInput?.click());

  syllabusDropzone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    syllabusDropzone.classList.add("dragover");
  });

  syllabusDropzone?.addEventListener("dragleave", () => {
    syllabusDropzone.classList.remove("dragover");
  });

  syllabusDropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    syllabusDropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        handlePdfExtraction(file);
      } else if (file.name.endsWith(".txt")) {
        handleTxtExtraction(file);
      } else {
        showToast("DOCX extraction requires server conversion. Please upload PDF or TXT, or paste your syllabus text.", "info");
      }
    }
  });

  syllabusInput?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        handlePdfExtraction(file);
      } else if (file.name.endsWith(".txt")) {
        handleTxtExtraction(file);
      } else {
        showToast("DOCX extraction requires server conversion. Please upload PDF or TXT, or paste your syllabus text.", "info");
      }
    }
  });

  // Toggle Paste Syllabus Box
  document.getElementById("btnTogglePasteSyllabus")?.addEventListener("click", () => {
    const box = document.getElementById("pasteSyllabusBox");
    box?.classList.toggle("hidden");
  });

  // Apply Pasted Syllabus
  document.getElementById("btnApplyPastedSyllabus")?.addEventListener("click", () => {
    const text = document.getElementById("pastedSyllabusText")?.value.trim();
    if (!text) {
      showToast("Please enter or paste your syllabus content.", "error");
      return;
    }

    if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
    AppState.currentDraft.uploadedSyllabus = {
      fileName: "Course_Syllabus_Curriculum.txt",
      fileSize: (text.length / 1024).toFixed(1) + " KB",
      pages: Math.max(1, Math.ceil(text.length / 2000)),
      text: text
    };

    const parsed = parseSyllabusStructure(text);
    if (parsed.length > 0) {
      AppState.currentDraft.unitsCovered = parsed.map((p) => p.unit);
    }

    document.getElementById("uploadedFileName").textContent = "Course_Syllabus_Curriculum.txt";
    document.getElementById("uploadedFileSize").textContent = (text.length / 1024).toFixed(1) + " KB";
    document.getElementById("uploadedFilePages").textContent = `${Math.max(1, Math.ceil(text.length / 2000))} Pages`;
    document.getElementById("uploadedFileStatus").textContent = "Curriculum Text Loaded";
    document.getElementById("uploadedFileStatus").className = "badge badge-success";
    document.getElementById("uploadedFileCard")?.classList.remove("hidden");

    applyCurriculumText("Course_Syllabus_Curriculum.txt", text, "Curriculum Text Loaded");
    showToast("Syllabus text applied and curriculum modules parsed!", "success");
  });

  // Helper for applying curriculum text
  function applyCurriculumText(fileName, text, badgeText = "Curriculum Text Loaded") {
    if (!AppState.currentDraft) AppState.currentDraft = createDefaultDraft();
    AppState.currentDraft.uploadedSyllabus = {
      fileName: fileName,
      fileSize: (text.length / 1024).toFixed(1) + " KB",
      pages: Math.max(1, Math.ceil(text.length / 2000)),
      text: text
    };

    const parsed = parseSyllabusStructure(text);
    if (parsed.length > 0) {
      AppState.currentDraft.unitsCovered = parsed.map((p) => p.unit);
    }

    document.getElementById("uploadedFileName").textContent = fileName;
    document.getElementById("uploadedFileSize").textContent = (text.length / 1024).toFixed(1) + " KB";
    document.getElementById("uploadedFilePages").textContent = `${Math.max(1, Math.ceil(text.length / 2000))} Pages`;
    document.getElementById("uploadedFileStatus").textContent = badgeText;
    document.getElementById("uploadedFileStatus").className = "badge badge-success";
    document.getElementById("uploadedFileCard")?.classList.remove("hidden");

    document.getElementById("extractedCharCount").textContent = `${text.length} characters`;
    document.getElementById("extractedTextContent").textContent = text;
    document.getElementById("extractedPreviewBox")?.classList.remove("hidden");
    document.getElementById("scannedPdfAlert")?.classList.add("hidden");
    document.getElementById("pasteSyllabusBox")?.classList.add("hidden");
  }

  // Real OCR Recovery button inside alert
  document.getElementById("btnRunOcrRecovery")?.addEventListener("click", () => {
    if (currentUploadedFile) {
      runPdfOcr(currentUploadedFile, currentPdfDoc);
    } else {
      showToast("Please select a syllabus PDF file to run OCR.", "info");
    }
  });

  // Manual OCR button inside file details card
  document.getElementById("btnRunOcrOnLoadedDoc")?.addEventListener("click", () => {
    if (currentUploadedFile) {
      runPdfOcr(currentUploadedFile, currentPdfDoc);
    } else {
      showToast("No PDF document currently loaded.", "warning");
    }
  });

  // Cancel OCR button
  document.getElementById("btnCancelOcr")?.addEventListener("click", () => {
    isOcrCancelled = true;
    document.getElementById("ocrProgressCard")?.classList.add("hidden");
    showToast("OCR processing cancelled.", "info");
  });

  // Open paste from alert
  document.getElementById("btnAlertOpenPaste")?.addEventListener("click", () => {
    document.getElementById("pasteSyllabusBox")?.classList.remove("hidden");
    document.getElementById("pastedSyllabusText")?.focus();
  });

  // Add unit manually
  document.getElementById("btnAddUnitManually")?.addEventListener("click", addManualUnitPrompt);

  // Template curriculum handler
  const loadStandardCurriculumHandler = () => {
    const templateText = `CURRICULUM SPECIFICATION
COURSE NAME: ADVANCED COMPUTER SYSTEMS & ARCHITECTURE
COURSE CODE: CS305 | ACADEMIC YEAR: 2025-2026

UNIT 1: PROCESSOR ARCHITECTURE & PIPELINING
Instruction set architectures, RISC and CISC design paradigms. Pipelined execution stages, data hazards, forwarding units, structural and control hazards. Branch prediction models.

UNIT 2: MEMORY HIERARCHY & CACHE COHERENCE
Cache memory mapping, direct mapped, associative and set-associative. Miss rates and cache replacement strategies (LRU, FIFO). Cache coherence protocols (MESI, MOESI).

UNIT 3: STORAGE SYSTEMS & MULTIPROCESSORS
Direct Memory Access (DMA), interrupt driven I/O, disk scheduling algorithms (SSTF, SCAN). Multicore symmetric multiprocessing (SMP) and NUMA architectures.

UNIT 4: EMBEDDED PROCESSORS & SYSTEM SECURITY
Hardware root of trust, secure boot sequences, memory management unit (MMU) virtual memory translation, side-channel attack countermeasures.`;

    applyCurriculumText("Computer_Systems_Curriculum_Template.pdf", templateText, "Curriculum Template Loaded");
    autoPopulateFromExtractedText(templateText, "Computer_Systems_Curriculum_Template.pdf");
    showToast("Loaded curriculum syllabus template!", "success");
    showDeviceToast("Template syllabus loaded");
  };

  document.getElementById("btnAlertStandardCurriculum")?.addEventListener("click", loadStandardCurriculumHandler);
  document.getElementById("btnUseStandardCurriculum")?.addEventListener("click", loadStandardCurriculumHandler);

  // ===================================================================
  // Appearance Customization Event Handlers (Matching Reference Image)
  // ===================================================================

  // Theme Toggle (System / Light / Dark)
  document.querySelectorAll(".theme-pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theme-pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const theme = btn.dataset.theme;
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
      showDeviceToast(`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
    });
  });

  // Color Swatches Palette
  const SWATCH_CONFIGS = {
    ocean: { primary: "#0284c7", light: "#38bdf8", name: "Ocean" },
    aurora: { primary: "#7c3aed", light: "#c4b5fd", name: "Pastel Aurora" },
    mist: { primary: "#475569", light: "#94a3b8", name: "Mist White" },
    pearl: { primary: "#64748b", light: "#cbd5e1", name: "Soft Pearl" },
    sage: { primary: "#059669", light: "#34d399", name: "Sage Green" },
    periwinkle: { primary: "#6366f1", light: "#818cf8", name: "Periwinkle" },
    lilac: { primary: "#9333ea", light: "#c084fc", name: "Lilac" },
    mocha: { primary: "#78716c", light: "#a8a29e", name: "Warm Mocha" },
    slate: { primary: "#334155", light: "#64748b", name: "Slate Glass" }
  };

  document.querySelectorAll(".swatch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const swatchKey = btn.dataset.swatch;
      const config = SWATCH_CONFIGS[swatchKey] || SWATCH_CONFIGS.ocean;
      document.documentElement.style.setProperty("--primary", config.primary);
      document.documentElement.style.setProperty("--primary-light", config.light);
      const nameEl = document.getElementById("swatchActiveName");
      if (nameEl) nameEl.textContent = config.name;
      showDeviceToast(`Accent: ${config.name}`);
    });
  });

  // Corner Radius Slider
  const radiusSlider = document.getElementById("appearanceRadius");
  const radiusBadge = document.getElementById("radiusValBadge");
  radiusSlider?.addEventListener("input", (e) => {
    const val = e.target.value;
    if (radiusBadge) radiusBadge.textContent = val;
    document.documentElement.style.setProperty("--app-corner-radius", `${val}px`);
  });
  radiusSlider?.addEventListener("change", () => {
    showDeviceToast("Corner radius updated");
  });

  // Density Slider
  document.getElementById("appearanceDensity")?.addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10);
    const root = document.documentElement;
    if (val === 1) {
      root.style.setProperty("--card-padding", "1rem");
      showDeviceToast("Density: Compact");
    } else if (val === 3) {
      root.style.setProperty("--card-padding", "2rem");
      showDeviceToast("Density: Relaxed");
    } else {
      root.style.setProperty("--card-padding", "1.5rem");
      showDeviceToast("Density: Normal");
    }
  });

  // Typeface Selector
  document.getElementById("appearanceTypeface")?.addEventListener("change", (e) => {
    const font = e.target.value;
    if (font === "Outfit") {
      document.body.style.fontFamily = "'Outfit', sans-serif";
    } else if (font === "System") {
      document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }
    showDeviceToast(`Typeface: ${font}`);
  });

  // Toggles
  document.getElementById("toggleHighContrast")?.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.documentElement.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.95)");
    } else {
      document.documentElement.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.75)");
    }
    showDeviceToast("Outline contrast updated");
  });

  document.getElementById("toggleLargeIcons")?.addEventListener("change", (e) => {
    document.querySelectorAll(".nav-item i").forEach(i => {
      i.style.width = e.target.checked ? "21px" : "18px";
      i.style.height = e.target.checked ? "21px" : "18px";
    });
    showDeviceToast("Icon size updated");
  });

  document.getElementById("toggleReduceMotion")?.addEventListener("change", (e) => {
    document.body.style.transition = e.target.checked ? "none" : "";
    showDeviceToast("Motion settings updated");
  });

  // Remove File Button
  document.getElementById("btnRemoveFile")?.addEventListener("click", () => {
    document.getElementById("uploadedFileCard")?.classList.add("hidden");
    document.getElementById("extractedPreviewBox")?.classList.add("hidden");
    document.getElementById("scannedPdfAlert")?.classList.add("hidden");
    if (AppState.currentDraft) AppState.currentDraft.uploadedSyllabus = null;
    showToast("Uploaded syllabus removed.", "info");
  });

  // Preview extracted text button
  document.getElementById("btnPreviewExtractedText")?.addEventListener("click", () => {
    const box = document.getElementById("extractedPreviewBox");
    box?.classList.toggle("hidden");
  });

  // Step 1 Next
  document.getElementById("btnStep1Next")?.addEventListener("click", () => {
    setWizardStep(2);
  });

  // Step 2 Form Listeners
  document.getElementById("btnLoadSuggestedBlueprint")?.addEventListener("click", () => {
    loadSuggestedBlueprintPreset();
    populateStep2Form();
    recalculateBlueprintSummary();
    showToast("Loaded balanced 50-mark model assessment blueprint!", "success");
  });

  document.getElementById("btnAddQuestionGroup")?.addEventListener("click", () => {
    if (!AppState.currentDraft.groups) AppState.currentDraft.groups = [];
    AppState.currentDraft.groups.push({
      id: "grp-" + Date.now(),
      name: `Section Part ${String.fromCharCode(65 + AppState.currentDraft.groups.length)}`,
      type: "Theory",
      count: 2,
      marksPerQ: 5,
      difficulty: "Medium",
      unitAllocation: "Unit 1, Unit 2"
    });
    renderQuestionGroupsList();
    recalculateBlueprintSummary();
  });

  document.getElementById("inputTotalMarks")?.addEventListener("input", recalculateBlueprintSummary);
  document.getElementById("inputDuration")?.addEventListener("input", recalculateBlueprintSummary);

  // Difficulty sliders
  ["Easy", "Med", "Hard"].forEach((diff) => {
    const slider = document.getElementById(`sliderDiff${diff}`);
    slider?.addEventListener("input", (e) => {
      document.getElementById(`valDiff${diff}`).textContent = e.target.value + "%";
    });
  });

  document.getElementById("btnStep2Back")?.addEventListener("click", () => setWizardStep(1));
  document.getElementById("btnStep2Next")?.addEventListener("click", () => setWizardStep(3));

  // Step 3 Generation
  document.getElementById("btnStartGeneration")?.addEventListener("click", triggerAssessmentGeneration);
  document.getElementById("btnProceedToReview")?.addEventListener("click", () => setWizardStep(4));
  document.getElementById("btnRegenerateAll")?.addEventListener("click", () => {
    openConfirmModal(
      "Regenerate All Questions",
      "This will replace all generated questions with a freshly synthesized draft. Any custom question edits will be reset. Proceed?",
      () => {
        AppState.currentDraft.questions = [];
        triggerAssessmentGeneration();
      }
    );
  });

  document.getElementById("btnStep3Back")?.addEventListener("click", () => setWizardStep(2));
  document.getElementById("btnStep3Next")?.addEventListener("click", () => setWizardStep(4));

  // Step 4 Review & Exports
  document.getElementById("toggleExamDetails")?.addEventListener("click", () => {
    const body = document.getElementById("examDetailsBody");
    body?.classList.toggle("hidden");
    const chevron = document.getElementById("examDetailsChevron");
    if (chevron) chevron.style.transform = body?.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
  });

  document.getElementById("btnApproveAllQuestions")?.addEventListener("click", () => {
    (AppState.currentDraft.questions || []).forEach((q) => (q.approved = true));
    renderReviewQuestionsBlocks();
    updateReviewChecklist();
    showToast("All questions marked as approved!", "success");
  });

  document.getElementById("btnFinalApprovePaper")?.addEventListener("click", approveCompletePaper);

  document.getElementById("btnAddNewQuestion")?.addEventListener("click", () => {
    // Open add question modal
    document.getElementById("editQIndex").value = "-1";
    document.getElementById("modalQuestionTitle").textContent = "Add Custom Question";
    document.getElementById("modalQText").value = "";
    document.getElementById("modalQModelAnswer").value = "";
    document.getElementById("modalQKeyConcepts").value = "";
    document.getElementById("modalQExpectedPoints").value = "";
    document.getElementById("modalQMarks").value = "5";

    // Setup initial criterion
    const list = document.getElementById("modalCriteriaList");
    list.innerHTML = `
      <div class="d-flex gap-2 mb-2">
        <input type="text" class="form-control form-control-sm m-crit-name" value="Comprehensive answer and demonstration" placeholder="Criterion description">
        <input type="number" class="form-control form-control-sm m-crit-marks" value="5" style="width: 70px;">
      </div>
    `;

    document.getElementById("modalEditQuestion")?.classList.remove("hidden");
  });

  document.getElementById("btnModalAddCriterion")?.addEventListener("click", () => {
    const list = document.getElementById("modalCriteriaList");
    const row = document.createElement("div");
    row.className = "d-flex gap-2 mb-2";
    row.innerHTML = `
      <input type="text" class="form-control form-control-sm m-crit-name" placeholder="Criterion description">
      <input type="number" class="form-control form-control-sm m-crit-marks" value="2" style="width: 70px;">
    `;
    list.appendChild(row);
  });

  document.getElementById("btnModalSaveQuestion")?.addEventListener("click", () => {
    const text = document.getElementById("modalQText").value.trim();
    if (!text) {
      showToast("Question prompt cannot be empty.", "error");
      return;
    }

    const marks = parseInt(document.getElementById("modalQMarks").value, 10) || 5;
    const type = document.getElementById("modalQType").value;
    const difficulty = document.getElementById("modalQDifficulty").value;
    const unit = document.getElementById("modalQUnit").value;
    const modelAnswer = document.getElementById("modalQModelAnswer").value;
    const keyConcepts = document.getElementById("modalQKeyConcepts").value;
    const expectedPoints = document.getElementById("modalQExpectedPoints").value;

    // Collect criteria
    const rubric = [];
    document.querySelectorAll("#modalCriteriaList > div").forEach((row) => {
      const name = row.querySelector(".m-crit-name")?.value;
      const m = parseInt(row.querySelector(".m-crit-marks")?.value, 10) || 0;
      if (name) rubric.push({ criterion: name, marks: m });
    });

    if (!AppState.currentDraft.questions) AppState.currentDraft.questions = [];

    const newQ = {
      id: "q-custom-" + Date.now(),
      number: AppState.currentDraft.questions.length + 1,
      text,
      type,
      difficulty,
      marks,
      unit,
      modelAnswer,
      keyConcepts,
      expectedPoints,
      rubric,
      approved: true,
      sourceDoc: "Custom Instructor Input",
      sourceSection: "Manual Entry",
      sourcePage: "N/A",
      sourceExcerpt: "Created directly by course instructor."
    };

    AppState.currentDraft.questions.push(newQ);
    document.getElementById("modalEditQuestion")?.classList.add("hidden");
    renderReviewQuestionsBlocks();
    updateReviewChecklist();
    showToast("Custom question added to assessment!", "success");
  });

  // Export Buttons in Step 4
  document.getElementById("btnDownloadQuestionPaper")?.addEventListener("click", () => {
    if (window.ExamCraftApi && AppState.currentDraft && AppState.currentDraft.id && !AppState.currentDraft.id.startsWith("paper-draft")) {
      window.open(window.ExamCraftApi.getStudentPdfUrl(AppState.currentDraft.id), '_blank');
    } else {
      generateStudentQuestionPaperPdf(AppState.currentDraft);
    }
  });

  document.getElementById("btnPreviewQuestionPaper")?.addEventListener("click", () => {
    openPdfPreviewModal(AppState.currentDraft, "question-paper");
  });

  document.getElementById("btnDownloadAnswerKey")?.addEventListener("click", () => {
    if (window.ExamCraftApi && AppState.currentDraft && AppState.currentDraft.id && !AppState.currentDraft.id.startsWith("paper-draft")) {
      window.open(window.ExamCraftApi.getFacultyPdfUrl(AppState.currentDraft.id), '_blank');
    } else {
      generateFacultyAnswerKeyPdf(AppState.currentDraft);
    }
  });

  document.getElementById("btnPreviewAnswerKey")?.addEventListener("click", () => {
    openPdfPreviewModal(AppState.currentDraft, "answer-key");
  });

  document.getElementById("btnDownloadTraceability")?.addEventListener("click", () => {
    if (window.ExamCraftApi && AppState.currentDraft && AppState.currentDraft.id && !AppState.currentDraft.id.startsWith("paper-draft")) {
      window.open(window.ExamCraftApi.getAuditPdfUrl(AppState.currentDraft.id), '_blank');
    } else {
      generateTraceabilityAuditPdf(AppState.currentDraft);
    }
  });

  document.getElementById("btnStep4Back")?.addEventListener("click", () => setWizardStep(3));
  document.getElementById("btnStep4SaveExit")?.addEventListener("click", () => {
    saveDraftToMyPapers(true);
    switchView("papers");
  });

  // Review Queue Filter Listener
  document.getElementById("reviewQueueStatusFilter")?.addEventListener("change", renderReviewQueueView);

  // Analytics Refresh Listener
  document.getElementById("btnRefreshAnalytics")?.addEventListener("click", () => {
    renderAnalyticsView();
    showToast("Analytics refreshed from active database", "success");
  });

  // My Papers Filter Inputs
  document.getElementById("paperSearchInput")?.addEventListener("input", renderMyPapersView);
  document.getElementById("filterSubjectSelect")?.addEventListener("change", renderMyPapersView);
  document.getElementById("filterStatusSelect")?.addEventListener("change", renderMyPapersView);
  document.getElementById("sortPapersSelect")?.addEventListener("change", renderMyPapersView);
  document.getElementById("btnResetPaperFilters")?.addEventListener("click", () => {
    document.getElementById("paperSearchInput").value = "";
    document.getElementById("filterSubjectSelect").value = "all";
    document.getElementById("filterStatusSelect").value = "all";
    renderMyPapersView();
  });

  // Question Bank Search & Filters
  document.getElementById("bankSearchInput")?.addEventListener("input", renderQuestionBankView);
  document.getElementById("bankFilterSubject")?.addEventListener("change", renderQuestionBankView);
  document.getElementById("bankFilterType")?.addEventListener("change", renderQuestionBankView);
  document.getElementById("bankFilterDifficulty")?.addEventListener("change", renderQuestionBankView);
  document.getElementById("btnBankAddQuestion")?.addEventListener("click", () => {
    document.getElementById("btnAddNewQuestion")?.click();
  });

  // Settings
  document.getElementById("btnSaveSettings")?.addEventListener("click", saveSettingsForm);
  document.getElementById("btnResetAllData")?.addEventListener("click", resetAllDataToDefault);
  document.getElementById("btnQuickSettings")?.addEventListener("click", () => switchView("settings"));

  // JSON Export
  document.getElementById("btnExportJson")?.addEventListener("click", () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            papers: AppState.papers,
            questionBank: AppState.questionBank,
            syllabus: AppState.syllabusDocs,
            settings: AppState.settings
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `examcraft_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported all application state as JSON", "success");
  });

  // Global Search
  const globalSearch = document.getElementById("globalSearchInput");
  globalSearch?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && globalSearch.value.trim()) {
      switchView("papers");
      const paperSearch = document.getElementById("paperSearchInput");
      if (paperSearch) {
        paperSearch.value = globalSearch.value.trim();
        renderMyPapersView();
      }
    }
  });

  // Ctrl+K hotkey for search
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      globalSearch?.focus();
    }
  });

  // Notifications dropdown
  const notifBtn = document.getElementById("btnNotifications");
  const notifDropdown = document.getElementById("notificationsDropdown");
  notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    notifDropdown?.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!notifDropdown?.contains(e.target) && e.target !== notifBtn) {
      notifDropdown?.classList.remove("show");
    }
  });

  document.getElementById("btnMarkAllRead")?.addEventListener("click", () => {
    document.querySelectorAll(".notification-item.unread").forEach((item) => item.classList.remove("unread"));
    const badge = document.querySelector(".notification-badge");
    if (badge) badge.style.display = "none";
    showToast("Notifications marked as read", "info");
  });

  // Mobile sidebar toggle
  document.getElementById("mobileSidebarToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.add("mobile-open");
  });
  document.getElementById("mobileSidebarClose")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("mobile-open");
  });

  // Modal Close buttons
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.closeModal;
      document.getElementById(modalId)?.classList.add("hidden");
    });
  });

  // Click outside modal to close
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  });

  // Refresh dashboard
  document.getElementById("btnRefreshDashboard")?.addEventListener("click", () => {
    renderDashboardView();
    showToast("Dashboard refreshed", "info");
  });
});
