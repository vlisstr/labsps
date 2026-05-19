'use strict';

const { IPasswordHasher } = require('../../domain/ports/IPasswordHasher');

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (_err) {
  bcrypt = null;
}

class BcryptPasswordHasher extends IPasswordHasher {

  constructor(rounds = 10) {
    super();
    if (!bcrypt) {
      throw new Error('bcryptjs is not installed. Run `npm install`.');
    }
    this._rounds = rounds;
  }

  async hash(plain) {
    return bcrypt.hash(plain, this._rounds);
  }

  async verify(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
}

module.exports = { BcryptPasswordHasher };
