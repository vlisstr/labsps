'use strict';

class ItemRecord {

  constructor({ id, name, description, owner_id }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.owner_id = owner_id;
  }
}

module.exports = { ItemRecord };
