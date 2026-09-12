const crypto = require('crypto');
const { coordinatorAgent } = require('../services/agents/coordinator.agent');
const store = require('../store/request.store');

function toFileMeta(files) {
  return (files || []).map(f => ({ originalname: f.originalname, size: f.size }));
}

function submit(req, res) {
  const { patientName, diagnosisText, procedureText } = req.body;
  const hasConservativeTherapyDocs = req.body.hasConservativeTherapyDocs === 'true';
  const id = crypto.randomBytes(6).toString('hex');
  const record = {
    id,
    patientName,
    diagnosisText,
    procedureText,
    hasConservativeTherapyDocs,
    files: toFileMeta(req.files),
    createdAt: new Date().toISOString(),
  };
  const result = coordinatorAgent(record);
  store.save(id, { ...record, result });
  res.json({ id, ...result });
}

function addDocuments(req, res) {
  const existing = store.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Request not found.' });
  const newFiles = toFileMeta(req.files);
  const updated = {
    ...existing,
    hasConservativeTherapyDocs: existing.hasConservativeTherapyDocs || newFiles.length > 0,
    files: [...existing.files, ...newFiles],
  };
  const result = coordinatorAgent(updated);
  store.save(req.params.id, { ...updated, result });
  res.json({ id: req.params.id, ...result });
}

function getById(req, res) {
  const existing = store.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Request not found.' });
  res.json({ id: req.params.id, ...existing.result });
}

module.exports = { submit, addDocuments, getById };
