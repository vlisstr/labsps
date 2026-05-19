'use strict';

class ITokenService {

  issue(_claims) {
    throw new Error('not implemented');
  }

  verify(_token) {
    throw new Error('not implemented');
  }
}

module.exports = { ITokenService };
