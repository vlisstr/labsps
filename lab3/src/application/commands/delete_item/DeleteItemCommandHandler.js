'use strict';

const { NotFoundError } = require('../../../domain/errors/DomainError');

class DeleteItemCommandHandler {
  constructor({ items }) {
    this._items = items;
  }

  async handle(command) {
    const item = await this._items.findById(command.id);
    if (!item) {
      throw new NotFoundError(`item ${command.id} not found`, 'ITEM_NOT_FOUND');
    }
    item.ensureCanBeDeletedBy(command.actorId);
    await this._items.deleteById(command.id);
  }
}

module.exports = { DeleteItemCommandHandler };
