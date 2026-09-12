const { STEP_THERAPY_REQUIRED } = require('../knowledge/policyRules');

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

module.exports = { insuranceAgent };
