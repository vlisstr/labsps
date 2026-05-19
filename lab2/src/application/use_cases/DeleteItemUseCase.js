'use strict';

const { NotFoundError } = require('../../domain/errors/DomainError');

class DeleteItemUseCase {

  constructor({ items }) {
    this._items = items;
  }

  async execute({ id, actorId }) {
    const item = await this._items.findById(id);
    if (!item) {
      throw new NotFoundError(`item ${id} not found`, 'ITEM_NOT_FOUND');
    }

    item.ensureCanBeDeletedBy(actorId);
    await this._items.deleteById(id);
  }
}

module.exports = { DeleteItemUseCase };
