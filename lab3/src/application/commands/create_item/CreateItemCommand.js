'use strict';

class CreateItemCommand {
  constructor({ name, description, ownerId }) {
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
    Object.freeze(this);
  }
}

module.exports = { CreateItemCommand };
