'use strict';

const { ItemName } = require('../../../domain/item/ItemName');
const { ItemDescription } = require('../../../domain/item/ItemDescription');
const { NotFoundError } = require('../../../domain/errors/DomainError');

class UpdateItemCommandHandler {
  constructor({ items }) {
    this._items = items;
  }

  async handle(command) {
    const item = await this._items.findById(command.id);
    if (!item) {
      throw new NotFoundError(`item ${command.id} not found`, 'ITEM_NOT_FOUND');
    }
    if (command.name !== undefined) {
      item.rename(new ItemName(command.name), command.actorId);
    }
    if (command.description !== undefined) {
      item.changeDescription(new ItemDescription(command.description), command.actorId);
    }
    await this._items.save(item);
  }
}

module.exports = { UpdateItemCommandHandler };
