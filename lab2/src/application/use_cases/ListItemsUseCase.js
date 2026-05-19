'use strict';

const { itemToView } = require('../dto/views');

class ListItemsUseCase {

  constructor({ items }) {
    this._items = items;
  }

  async execute() {
    const all = await this._items.findAll();
    return all.map(itemToView);
  }
}

module.exports = { ListItemsUseCase };
