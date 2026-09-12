const { app } = require('./app');
const { port } = require('./config');

app.listen(port, () => console.log(`Prior-auth demo server running on http://localhost:${port}`));
