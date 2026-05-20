'use strict';

const { buildSystem } = require('./src/composition_root');

const { app } = buildSystem({
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod',
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`lab5 modular monolith listening on http://localhost:${PORT}`);
  console.log('Modules: core, audit, analytics');
  console.log('Inter-module communication: in-process event bus');
});
