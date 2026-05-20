'use strict';

class CreateItemCommandHandler {
  constructor({ items, itemFactory }) {
    this._items = items;
    this._itemFactory = itemFactory;
  }

  async handle(command) {
    const item = await this._itemFactory.create({
      name: command.name,
      description: command.description,
      ownerId: command.ownerId,
    });
    await this._items.save(item);
    return item.id;
  }
}

module.exports = { CreateItemCommandHandler };
