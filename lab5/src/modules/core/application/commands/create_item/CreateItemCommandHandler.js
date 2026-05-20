'use strict';

const { ItemCreated } = require('../../events/ItemCreated');

class CreateItemCommandHandler {
  constructor({ items, itemFactory, eventBus }) {
    this._items = items;
    this._itemFactory = itemFactory;
    this._eventBus = eventBus;
  }

  async handle(command) {
    const item = await this._itemFactory.create({
      name: command.name,
      description: command.description,
      ownerId: command.ownerId,
    });
    await this._items.save(item);

    if (this._eventBus) {
      await this._eventBus.publish(new ItemCreated({
        itemId: item.id,
        name: item.name.value,
        ownerId: item.ownerId,
        occurredAt: new Date().toISOString(),
      }));
    }

    return item.id;
  }
}

module.exports = { CreateItemCommandHandler };
