'use strict';

const { NotFoundError } = require('../../../domain/errors/DomainError');

class GetItemQueryHandler {
  constructor({ itemsRead }) {
    this._itemsRead = itemsRead;
  }

  async handle(query) {
    const dto = await this._itemsRead.findById(query.id);
    if (!dto) {
      throw new NotFoundError(`item ${query.id} not found`, 'ITEM_NOT_FOUND');
    }
    return dto;
  }
}

module.exports = { GetItemQueryHandler };
