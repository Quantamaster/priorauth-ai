const express = require('express');
const cors = require('cors');
const { staticDir } = require('./config');
const { apiRouter } = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(staticDir));
app.use('/api', apiRouter);

module.exports = { app };
