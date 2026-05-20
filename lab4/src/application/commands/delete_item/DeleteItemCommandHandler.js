'use strict';

const { NotFoundError } = require('../../../domain/errors/DomainError');
const { AuditEntry } = require('../../../audit/AuditEntry');
const { ItemDeleted } = require('../../events/ItemDeleted');

class DeleteItemCommandHandler {
  constructor({ items, mode, auditLogger, eventBus }) {
    this._items = items;
    this._mode = mode || 'sync';
    this._auditLogger = auditLogger || null;
    this._eventBus = eventBus || null;
  }

  async handle(command) {
    const item = await this._items.findById(command.id);
    if (!item) {
      throw new NotFoundError(`item ${command.id} not found`, 'ITEM_NOT_FOUND');
    }
    item.ensureCanBeDeletedBy(command.actorId);
    await this._items.deleteById(command.id);

    const occurredAt = new Date().toISOString();

    if (this._mode === 'sync' && this._auditLogger) {
      try {
        await this._auditLogger.record(new AuditEntry({
          action: 'item.deleted',
          entityType: 'item',
          entityId: command.id,
          actorId: command.actorId,
          details: {},
          occurredAt,
        }));
      } catch (err) {
        console.error('[sync] audit failed, ignoring:', err.message);
      }
    } else if (this._mode === 'async' && this._eventBus) {
      await this._eventBus.publish(new ItemDeleted({
        itemId: command.id,
        actorId: command.actorId,
        occurredAt,
      }));
    }
  }
}

module.exports = { DeleteItemCommandHandler };
