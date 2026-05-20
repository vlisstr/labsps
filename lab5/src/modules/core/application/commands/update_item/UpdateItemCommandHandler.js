'use strict';

const { ItemName } = require('../../../domain/item/ItemName');
const { ItemDescription } = require('../../../domain/item/ItemDescription');
const { NotFoundError } = require('../../../domain/errors/DomainError');
const { ItemUpdated } = require('../../events/ItemUpdated');

class UpdateItemCommandHandler {
  constructor({ items, eventBus }) {
    this._items = items;
    this._eventBus = eventBus;
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

    if (this._eventBus) {
      await this._eventBus.publish(new ItemUpdated({
        itemId: item.id,
        actorId: command.actorId,
        changes,
        occurredAt: new Date().toISOString(),
      }));
    }
  }
}

module.exports = { UpdateItemCommandHandler };
