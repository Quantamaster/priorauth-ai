const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// In-memory "database" of prior-auth requests. Fine for a demo; swap for a
// real DB (Postgres/Mongo) before this ever sees production traffic.
// ---------------------------------------------------------------------------
const requests = new Map();

// ---------------------------------------------------------------------------
// Mock knowledge bases the "agents" reason over
// ---------------------------------------------------------------------------
const ICD10_MAP = {
  knee: { code: 'M25.561', label: 'Pain in right knee' },
  shoulder: { code: 'M25.511', label: 'Pain in right shoulder' },
  back: { code: 'M54.5', label: 'Low back pain' },
  headache: { code: 'R51', label: 'Headache' },
  chest: { code: 'R07.9', label: 'Chest pain, unspecified' },
};

const CPT_MAP = {
  mri: { code: '73721', label: 'MRI, lower extremity joint' },
  ct: { code: '74176', label: 'CT scan, abdomen' },
  xray: { code: '73560', label: 'X-ray, knee' },
  ultrasound: { code: '76700', label: 'Ultrasound, abdomen' },
};

// Which procedures require step-therapy documentation before approval
const STEP_THERAPY_REQUIRED = new Set(['mri', 'ct']);

function detectKeyword(text, map) {
  const lower = (text || '').toLowerCase();
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return { key, ...map[key] };
  }
  return null;
}

// ---------------------------------------------------------------------------
// "Agents" — each is just a pure function here, but named/shaped so the
// mapping back to Medical / Insurance / Decision / Coordinator is explicit.
// ---------------------------------------------------------------------------
function medicalAgent({ diagnosisText, procedureText }) {
  const diagnosis = detectKeyword(diagnosisText, ICD10_MAP);
  const procedure = detectKeyword(procedureText, CPT_MAP);
  return {
    diagnosis,
    procedure,
    codesValid: Boolean(diagnosis && procedure),
    notes: diagnosis && procedure
      ? `Matched ${diagnosis.code} (${diagnosis.label}) with ${procedure.code} (${procedure.label}).`
      : 'Could not confidently match diagnosis/procedure text to a known code pair.',
  };
}

function insuranceAgent({ procedure, hasConservativeTherapyDocs }) {
  const requiresStepTherapy = procedure && STEP_THERAPY_REQUIRED.has(procedure.key);
  const satisfied = !requiresStepTherapy || hasConservativeTherapyDocs;
  return {
    requiresStepTherapy,
    satisfied,
    notes: !requiresStepTherapy
      ? 'No step-therapy requirement for this procedure under the policy.'
      : hasConservativeTherapyDocs
        ? 'Step-therapy requirement satisfied by uploaded records.'
        : 'Policy requires 6 weeks of documented conservative therapy before imaging.',
  };
}

function decisionAgent({ medical, insurance }) {
  let probability = 55;
  const missing = [];

  if (medical.codesValid) probability += 20;
  else missing.push('Clear diagnosis and procedure description (for code matching)');

  if (insurance.requiresStepTherapy) {
    if (insurance.satisfied) probability += 22;
    else {
      probability -= 5;
      missing.push('6 weeks of conservative therapy (e.g. physical therapy) records');
    }
  } else {
    probability += 15;
  }

  probability = Math.max(5, Math.min(97, probability));

  let status;
  if (probability >= 90) status = 'APPROVED';
  else if (probability >= 65) status = 'NEEDS_MORE_INFO';
  else status = 'LIKELY_DENIED';

  return { probability, status, missing };
}

function coordinatorAgent(request) {
  const medical = medicalAgent(request);
  const insurance = insuranceAgent({ procedure: medical.procedure, hasConservativeTherapyDocs: request.hasConservativeTherapyDocs });
  const decision = decisionAgent({ medical, insurance });

  const steps = [
    { key: 'request_initiated', label: 'Request Initiated', detail: 'Received request and attached documents.' },
    { key: 'documents_extracted', label: 'Documents Extracted', detail: request.files.length
        ? `OCR processed ${request.files.length} file(s): ${request.files.map(f => f.originalname).join(', ')}.`
        : 'No files attached — using typed description only.' },
    { key: 'medical_validation', label: 'Medical Validation', detail: medical.notes },
    { key: 'policy_check', label: 'Policy Check', detail: insurance.notes },
    { key: 'decision', label: 'Decision + Visibility', detail: `Approval probability: ${decision.probability}%.` },
  ];

  return { medical, insurance, decision, steps };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.post('/api/prior-auth/submit', upload.array('documents'), (req, res) => {
  const { patientName, diagnosisText, procedureText } = req.body;
  const hasConservativeTherapyDocs = req.body.hasConservativeTherapyDocs === 'true';

  if (!patientName || !diagnosisText || !procedureText) {
    return res.status(400).json({ error: 'patientName, diagnosisText, and procedureText are required.' });
  }

  const id = crypto.randomBytes(6).toString('hex');
  const record = {
    id,
    patientName,
    diagnosisText,
    procedureText,
    hasConservativeTherapyDocs,
    files: (req.files || []).map(f => ({ originalname: f.originalname, size: f.size })),
    createdAt: new Date().toISOString(),
  };

  const result = coordinatorAgent(record);
  requests.set(id, { ...record, result });

  res.json({ id, ...result });
});

app.post('/api/prior-auth/:id/add-documents', upload.array('documents'), (req, res) => {
  const existing = requests.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Request not found.' });

  const newFiles = (req.files || []).map(f => ({ originalname: f.originalname, size: f.size }));
  const updated = {
    ...existing,
    hasConservativeTherapyDocs: existing.hasConservativeTherapyDocs || newFiles.length > 0,
    files: [...existing.files, ...newFiles],
  };

  const result = coordinatorAgent(updated);
  requests.set(req.params.id, { ...updated, result });

  res.json({ id: req.params.id, ...result });
});

app.get('/api/prior-auth/:id', (req, res) => {
  const existing = requests.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Request not found.' });
  res.json({ id: req.params.id, ...existing.result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Prior-auth demo server running on http://localhost:${PORT}`));
