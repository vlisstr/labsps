'use strict';

const { Item } = require('./Item');
const { ItemName } = require('./ItemName');
const { ItemDescription } = require('./ItemDescription');

class ItemFactory {

  constructor({ items }) {
    this._items = items;
  }

  async create({ name, description, ownerId }) {
    const nameVo = new ItemName(name);
    const descVo = new ItemDescription(description ?? '');
    const id = await this._items.nextId();
    return new Item({ id, name: nameVo, description: descVo, ownerId });
  }
}

module.exports = { ItemFactory };
