const { detectKeyword } = require('../../utils/textMatch');
const { ICD10_MAP, CPT_MAP } = require('../knowledge/medicalCodes');

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

module.exports = { medicalAgent };
