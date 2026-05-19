'use strict';

const { buildContainer } = require('./src/infrastructure/config/container');
const { buildApp } = require('./src/presentation/app');

const container = buildContainer({
  persistence: process.env.PERSISTENCE || 'memory',
  sqliteFile: process.env.SQLITE_FILE || 'lab2.db',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod',
});

const app = buildApp(container);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {

  console.log(`lab2 server listening on http://localhost:${PORT} (persistence=${process.env.PERSISTENCE || 'memory'})`);
});
