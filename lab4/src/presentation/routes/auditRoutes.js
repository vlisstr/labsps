'use strict';

const express = require('express');

function buildAuditRouter({ auditLogger }) {
  const router = express.Router();

  router.get('/', async (_req, res, next) => {
    try {
      const entries = await auditLogger.findAll();
      res.json(entries);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAuditRouter };
