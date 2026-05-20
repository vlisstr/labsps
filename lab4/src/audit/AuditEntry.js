'use strict';

class AuditEntry {
  constructor({ action, entityType, entityId, actorId, details, occurredAt }) {
    if (typeof action !== 'string' || action.length === 0) {
      throw new Error('AuditEntry.action must be a non-empty string');
    }
    this.action = action;
    this.entityType = entityType;
    this.entityId = entityId;
    this.actorId = actorId ?? null;
    this.details = Object.freeze({ ...(details ?? {}) });
    this.occurredAt = occurredAt;
    Object.freeze(this);
  }
}

module.exports = { AuditEntry };
