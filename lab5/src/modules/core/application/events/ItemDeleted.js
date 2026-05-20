'use strict';

class ItemDeleted {
  constructor({ itemId, actorId, occurredAt }) {
    this.type = 'ItemDeleted';
    this.itemId = itemId;
    this.actorId = actorId;
    this.occurredAt = occurredAt;
    Object.freeze(this);
  }
}

module.exports = { ItemDeleted };
