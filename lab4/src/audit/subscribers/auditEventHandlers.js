'use strict';

const { AuditEntry } = require('../AuditEntry');

function onUserRegistered(auditLogger) {
  return async (event) => {
    await auditLogger.record(
      new AuditEntry({
        action: 'user.registered',
        entityType: 'user',
        entityId: event.userId,
        actorId: event.userId,
        details: { username: event.username },
        occurredAt: event.occurredAt,
      })
    );
  };
}

function onItemCreated(auditLogger) {
  return async (event) => {
    await auditLogger.record(
      new AuditEntry({
        action: 'item.created',
        entityType: 'item',
        entityId: event.itemId,
        actorId: event.ownerId,
        details: { name: event.name },
        occurredAt: event.occurredAt,
      })
    );
  };
}

function onItemUpdated(auditLogger) {
  return async (event) => {
    await auditLogger.record(
      new AuditEntry({
        action: 'item.updated',
        entityType: 'item',
        entityId: event.itemId,
        actorId: event.actorId,
        details: { changes: event.changes },
        occurredAt: event.occurredAt,
      })
    );
  };
}

function onItemDeleted(auditLogger) {
  return async (event) => {
    await auditLogger.record(
      new AuditEntry({
        action: 'item.deleted',
        entityType: 'item',
        entityId: event.itemId,
        actorId: event.actorId,
        details: {},
        occurredAt: event.occurredAt,
      })
    );
  };
}

module.exports = { onUserRegistered, onItemCreated, onItemUpdated, onItemDeleted };
