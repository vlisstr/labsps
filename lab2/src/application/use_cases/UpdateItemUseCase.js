'use strict';

const { itemToView } = require('../dto/views');
const { ItemName } = require('../../domain/item/ItemName');
const { ItemDescription } = require('../../domain/item/ItemDescription');
const { NotFoundError } = require('../../domain/errors/DomainError');

class UpdateItemUseCase {

  constructor({ items }) {
    this._items = items;
  }

  async execute({ id, actorId, name, description }) {
    const item = await this._items.findById(id);
    if (!item) {
      throw new NotFoundError(`item ${id} not found`, 'ITEM_NOT_FOUND');
    }

    if (name !== undefined) {
      item.rename(new ItemName(name), actorId);
    }
    if (description !== undefined) {
      item.changeDescription(new ItemDescription(description), actorId);
    }

    await this._items.save(item);
    return itemToView(item);
  }
}

module.exports = { UpdateItemUseCase };
