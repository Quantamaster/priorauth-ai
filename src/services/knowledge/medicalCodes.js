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

module.exports = { ICD10_MAP, CPT_MAP };
