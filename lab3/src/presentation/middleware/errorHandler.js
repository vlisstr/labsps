'use strict';

const {
  DomainError,
  ValidationError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  AuthenticationError,
} = require('../../domain/errors/DomainError');

function errorHandler(err, _req, res, _next) {
  if (err instanceof ValidationError) {
    return res.status(422).json({ error: err.message, code: err.code });
  }
  if (err instanceof AuthenticationError) {
    return res.status(401).json({ error: err.message, code: err.code });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message, code: err.code });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message, code: err.code });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message, code: err.code });
  }
  if (err instanceof DomainError) {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({ error: 'internal server error', code: 'INTERNAL' });
}

module.exports = { errorHandler };
