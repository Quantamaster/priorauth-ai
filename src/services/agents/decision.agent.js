const { decisionThresholds } = require('../../config');

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
  if (probability >= decisionThresholds.approved) status = 'APPROVED';
  else if (probability >= decisionThresholds.needsInfo) status = 'NEEDS_MORE_INFO';
  else status = 'LIKELY_DENIED';

  return { probability, status, missing };
}

module.exports = { decisionAgent };
