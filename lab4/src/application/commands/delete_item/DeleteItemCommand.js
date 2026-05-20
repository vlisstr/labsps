'use strict';

class DeleteItemCommand {
  constructor({ id, actorId }) {
    this.id = id;
    this.actorId = actorId;
    Object.freeze(this);
  }
}

module.exports = { DeleteItemCommand };
