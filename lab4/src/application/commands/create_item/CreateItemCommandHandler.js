'use strict';

const { AuditEntry } = require('../../../audit/AuditEntry');
const { ItemCreated } = require('../../events/ItemCreated');

class CreateItemCommandHandler {
  constructor({ items, itemFactory, mode, auditLogger, eventBus }) {
    this._items = items;
    this._itemFactory = itemFactory;
    this._mode = mode || 'sync';
    this._auditLogger = auditLogger || null;
    this._eventBus = eventBus || null;
  }

  async handle(command) {
    const item = await this._itemFactory.create({
      name: command.name,
      description: command.description,
      ownerId: command.ownerId,
    });
    await this._items.save(item);

    const occurredAt = new Date().toISOString();

    if (this._mode === 'sync' && this._auditLogger) {
      try {
        await this._auditLogger.record(new AuditEntry({
          action: 'item.created',
          entityType: 'item',
          entityId: item.id,
          actorId: item.ownerId,
          details: { name: item.name.value },
          occurredAt,
        }));
      } catch (err) {
        console.error('[sync] audit failed, ignoring:', err.message);
      }
    } else if (this._mode === 'async' && this._eventBus) {
      await this._eventBus.publish(new ItemCreated({
        itemId: item.id,
        name: item.name.value,
        ownerId: item.ownerId,
        occurredAt,
      }));
    }

    return item.id;
  }
}

module.exports = { CreateItemCommandHandler };
