'use strict';

class UpdateItemCommand {
  constructor({ id, actorId, name, description }) {
    this.id = id;
    this.actorId = actorId;
    this.name = name;
    this.description = description;
    Object.freeze(this);
  }
}

module.exports = { UpdateItemCommand };
