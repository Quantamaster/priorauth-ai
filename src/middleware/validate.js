function requirePriorAuthFields(req, res, next) {
  const { patientName, diagnosisText, procedureText } = req.body;
  if (!patientName || !diagnosisText || !procedureText) {
    return res.status(400).json({ error: 'patientName, diagnosisText, and procedureText are required.' });
  }
  next();
}

module.exports = { requirePriorAuthFields };
