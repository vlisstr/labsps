'use strict';

class ItemCreated {
  constructor({ itemId, name, ownerId, occurredAt }) {
    this.type = 'ItemCreated';
    this.itemId = itemId;
    this.name = name;
    this.ownerId = ownerId;
    this.occurredAt = occurredAt;
    Object.freeze(this);
  }
}

module.exports = { ItemCreated };
