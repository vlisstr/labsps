'use strict';

const { NotFoundError } = require('../../../domain/errors/DomainError');
const { ItemDeleted } = require('../../events/ItemDeleted');

class DeleteItemCommandHandler {
  constructor({ items, eventBus }) {
    this._items = items;
    this._eventBus = eventBus;
  }

  async handle(command) {
    const item = await this._items.findById(command.id);
    if (!item) {
      throw new NotFoundError(`item ${command.id} not found`, 'ITEM_NOT_FOUND');
    }
    item.ensureCanBeDeletedBy(command.actorId);
    await this._items.deleteById(command.id);

    if (this._eventBus) {
      await this._eventBus.publish(new ItemDeleted({
        itemId: command.id,
        actorId: command.actorId,
        occurredAt: new Date().toISOString(),
      }));
    }
  }
}

module.exports = { DeleteItemCommandHandler };
