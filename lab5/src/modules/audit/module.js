'use strict';

const express = require('express');
const { InMemoryAuditLogger } = require('./infrastructure/InMemoryAuditLogger');
const {
  registerAuditSubscribers,
} = require('./application/subscribers/registerAuditSubscribers');

function buildAuditModule({ eventBus }) {
  const auditLogger = new InMemoryAuditLogger();
  registerAuditSubscribers({ eventBus, auditLogger });

  const router = express.Router();
  router.get('/', async (_req, res, next) => {
    try {
      res.json(await auditLogger.findAll());
    } catch (err) { next(err); }
  });

  return {
    routes: { audit: router },
    auditLogger,
  };
}

module.exports = { buildAuditModule };
