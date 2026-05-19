'use strict';

const { itemToView } = require('../dto/views');
const { NotFoundError } = require('../../domain/errors/DomainError');

class GetItemUseCase {

  constructor({ items }) {
    this._items = items;
  }

  async execute({ id }) {
    const item = await this._items.findById(id);
    if (!item) {
      throw new NotFoundError(`item ${id} not found`, 'ITEM_NOT_FOUND');
    }
    return itemToView(item);
  }
}

module.exports = { GetItemUseCase };
