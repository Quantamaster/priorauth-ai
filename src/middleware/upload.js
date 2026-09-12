const multer = require('multer');
const { upload: uploadConfig } = require('../config');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadConfig.maxFileSize },
});

module.exports = { upload };
