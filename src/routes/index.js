const { Router } = require('express');
const { priorAuthRouter } = require('./priorAuth.routes');

const router = Router();
router.use('/prior-auth', priorAuthRouter);

module.exports = { apiRouter: router };
