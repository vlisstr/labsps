'use strict';

const { itemToView } = require('../dto/views');

class CreateItemUseCase {

  constructor({ items, itemFactory }) {
    this._items = items;
    this._itemFactory = itemFactory;
  }

  async execute({ name, description, ownerId }) {
    const item = await this._itemFactory.create({ name, description, ownerId });
    await this._items.save(item);
    return itemToView(item);
  }
}

module.exports = { CreateItemUseCase };
