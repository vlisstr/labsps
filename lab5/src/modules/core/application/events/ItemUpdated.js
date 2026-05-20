'use strict';

class ItemUpdated {
  constructor({ itemId, actorId, changes, occurredAt }) {
    this.type = 'ItemUpdated';
    this.itemId = itemId;
    this.actorId = actorId;
    this.changes = Object.freeze({ ...changes });
    this.occurredAt = occurredAt;
    Object.freeze(this);
  }
}

module.exports = { ItemUpdated };
