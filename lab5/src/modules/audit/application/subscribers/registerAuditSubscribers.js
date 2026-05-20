'use strict';

const {
  onUserRegistered,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
} = require('./auditEventHandlers');

function registerAuditSubscribers({ eventBus, auditLogger }) {
  eventBus.subscribe('UserRegistered', onUserRegistered(auditLogger));
  eventBus.subscribe('ItemCreated', onItemCreated(auditLogger));
  eventBus.subscribe('ItemUpdated', onItemUpdated(auditLogger));
  eventBus.subscribe('ItemDeleted', onItemDeleted(auditLogger));
}

module.exports = { registerAuditSubscribers };
