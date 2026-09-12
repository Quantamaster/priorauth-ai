const { medicalAgent } = require('./medical.agent');
const { insuranceAgent } = require('./insurance.agent');
const { decisionAgent } = require('./decision.agent');

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

module.exports = { coordinatorAgent };
