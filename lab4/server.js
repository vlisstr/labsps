'use strict';

const { buildContainer } = require('./src/infrastructure/config/container');
const { buildApp } = require('./src/presentation/app');

const container = buildContainer({
  persistence: process.env.PERSISTENCE || 'memory',
  sqliteFile: process.env.SQLITE_FILE || 'lab4.db',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod',
  communicationMode: process.env.COMMUNICATION_MODE || 'async',
});

const app = buildApp(container);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(
    `lab4 server listening on http://localhost:${PORT} ` +
    `(persistence=${process.env.PERSISTENCE || 'memory'}, ` +
    `mode=${container.mode})`
  );
});
