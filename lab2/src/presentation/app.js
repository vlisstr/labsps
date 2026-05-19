'use strict';

const express = require('express');
const cors = require('cors');

const { buildAuthRouter } = require('./routes/authRoutes');
const { buildItemsRouter } = require('./routes/itemsRoutes');
const { buildAuthMiddleware } = require('./middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorHandler');

function buildApp(container) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const authMiddleware = buildAuthMiddleware(container.tokens);

  app.use('/auth', buildAuthRouter(container));
  app.use('/items', buildItemsRouter({ useCases: container.useCases, authMiddleware }));

  app.use(errorHandler);
  return app;
}

module.exports = { buildApp };
