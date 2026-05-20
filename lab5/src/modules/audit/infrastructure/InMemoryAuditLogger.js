'use strict';

const { IAuditLogger } = require('../application/IAuditLogger');

class InMemoryAuditLogger extends IAuditLogger {
  constructor() {
    super();
    this._entries = [];
    this._processedKeys = new Set();
  }

  async record(entry) {
    const key = `${entry.action}:${entry.entityType}:${entry.entityId}:${entry.occurredAt}`;
    if (this._processedKeys.has(key)) {
      return;
    }
    this._processedKeys.add(key);
    this._entries.push(entry);
  }

  async findAll() {
    return [...this._entries];
  }

  size() {
    return this._entries.length;
  }
}

module.exports = { InMemoryAuditLogger };
