'use strict';

const { ItemName } = require('../../../domain/item/ItemName');
const { ItemDescription } = require('../../../domain/item/ItemDescription');
const { NotFoundError } = require('../../../domain/errors/DomainError');
const { AuditEntry } = require('../../../audit/AuditEntry');
const { ItemUpdated } = require('../../events/ItemUpdated');

class UpdateItemCommandHandler {
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
    const changes = {};
    if (command.name !== undefined) {
      item.rename(new ItemName(command.name), command.actorId);
      changes.name = command.name;
    }
    if (command.description !== undefined) {
      item.changeDescription(new ItemDescription(command.description), command.actorId);
      changes.description = command.description;
    }
    await this._items.save(item);

    const occurredAt = new Date().toISOString();

    if (this._mode === 'sync' && this._auditLogger) {
      try {
        await this._auditLogger.record(new AuditEntry({
          action: 'item.updated',
          entityType: 'item',
          entityId: item.id,
          actorId: command.actorId,
          details: { changes },
          occurredAt,
        }));
      } catch (err) {
        console.error('[sync] audit failed, ignoring:', err.message);
      }
    } else if (this._mode === 'async' && this._eventBus) {
      await this._eventBus.publish(new ItemUpdated({
        itemId: item.id,
        actorId: command.actorId,
        changes,
        occurredAt,
      }));
    }
  }
}

module.exports = { UpdateItemCommandHandler };
