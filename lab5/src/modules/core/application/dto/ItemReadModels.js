'use strict';

class ItemListItemDTO {
  constructor({ id, name, description, ownerId, ownerUsername }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
    this.ownerUsername = ownerUsername;
    Object.freeze(this);
  }
}

class ItemDetailDTO {
  constructor({ id, name, description, ownerId, ownerUsername }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
    this.ownerUsername = ownerUsername;
    Object.freeze(this);
  }
}

module.exports = { ItemListItemDTO, ItemDetailDTO };
