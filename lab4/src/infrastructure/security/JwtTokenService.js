'use strict';

const { ITokenService } = require('../../domain/ports/ITokenService');
const { AuthenticationError } = require('../../domain/errors/DomainError');

let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (_err) {
  jwt = null;
}

class JwtTokenService extends ITokenService {

  constructor({ secret, expiresIn = '2h' }) {
    super();
    if (!jwt) {
      throw new Error('jsonwebtoken is not installed. Run `npm install`.');
    }
    if (!secret || typeof secret !== 'string') {
      throw new Error('JwtTokenService requires a non-empty secret');
    }
    this._secret = secret;
    this._expiresIn = expiresIn;
  }

  issue(claims) {
    return jwt.sign(claims, this._secret, { expiresIn: this._expiresIn });
  }

  verify(token) {
    try {
      return jwt.verify(token, this._secret);
    } catch (_err) {

      throw new AuthenticationError('invalid or expired token', 'INVALID_TOKEN');
    }
  }
}

module.exports = { JwtTokenService };
