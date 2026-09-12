const { Router } = require('express');
const { upload } = require('../middleware/upload');
const { requirePriorAuthFields } = require('../middleware/validate');
const controller = require('../controllers/priorAuth.controller');
const { upload: uploadConfig } = require('../config');

const router = Router();

router.post('/submit', upload.array(uploadConfig.fieldName), requirePriorAuthFields, controller.submit);
router.post('/:id/add-documents', upload.array(uploadConfig.fieldName), controller.addDocuments);
router.get('/:id', controller.getById);

module.exports = { priorAuthRouter: router };
