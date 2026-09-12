const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  upload: {
    maxFileSize: 8 * 1024 * 1024,
    fieldName: 'documents',
  },
  staticDir: path.join(__dirname, '..', '..', 'public'),
  decisionThresholds: { approved: 90, needsInfo: 65 },
};
