'use strict';

class IAuditLogger {
  async record(_entry) {
    throw new Error('not implemented');
  }

  async findAll() {
    throw new Error('not implemented');
  }
}

module.exports = { IAuditLogger };
