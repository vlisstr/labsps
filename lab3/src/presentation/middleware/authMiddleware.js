'use strict';

const { AuthenticationError } = require('../../domain/errors/DomainError');

function buildAuthMiddleware(tokens) {
  return function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new AuthenticationError('missing token', 'MISSING_TOKEN'));
    }
    try {
      const claims = tokens.verify(header.slice(7));
      req.user = claims;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { buildAuthMiddleware };
