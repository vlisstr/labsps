'use strict';

class ListItemsQueryHandler {
  constructor({ itemsRead }) {
    this._itemsRead = itemsRead;
  }

  async handle(_query) {
    return this._itemsRead.findAll();
  }
}

module.exports = { ListItemsQueryHandler };
