'use strict';

const express = require('express');
const cors = require('cors');

const { InProcessEventBus } = require('./shared/event_bus/InProcessEventBus');

const { buildCoreModule } = require('./modules/core/module');
const { buildAuditModule } = require('./modules/audit/module');
const { buildAnalyticsModule } = require('./modules/analytics/module');

const { errorHandler } = require('./presentation/middleware/errorHandler');

function buildSystem(opts = {}) {
  const eventBus = opts.eventBus || new InProcessEventBus();

  const audit = buildAuditModule({ eventBus });
  const analytics = buildAnalyticsModule({ eventBus });
  const core = buildCoreModule({ eventBus, jwtSecret: opts.jwtSecret });

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/auth', core.routes.auth);
  app.use('/items', core.routes.items);
  app.use('/audit', audit.routes.audit);
  app.use('/analytics', analytics.routes.analytics);

  app.use(errorHandler);

  return { app, eventBus, core, audit, analytics };
}

module.exports = { buildSystem };
