'use strict';

class IPasswordHasher {

  async hash(_plain) {
    throw new Error('not implemented');
  }

  async verify(_plain, _hashed) {
    throw new Error('not implemented');
  }
}

module.exports = { IPasswordHasher };
