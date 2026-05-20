'use strict';

const { ItemName } = require('./ItemName');
const { ItemDescription } = require('./ItemDescription');
const { ValidationError, ForbiddenError } = require('../errors/DomainError');

class Item {

  constructor({ id, name, description, ownerId }) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('item id must be a positive integer', 'ITEM_ID_INVALID');
    }
    if (!Number.isInteger(ownerId) || ownerId <= 0) {
      throw new ValidationError('ownerId must be a positive integer', 'ITEM_OWNER_INVALID');
    }
    if (!(name instanceof ItemName)) {
      throw new ValidationError('name must be ItemName VO', 'ITEM_NAME_INVALID');
    }
    if (!(description instanceof ItemDescription)) {
      throw new ValidationError(
        'description must be ItemDescription VO',
        'ITEM_DESCRIPTION_INVALID'
      );
    }

    this._id = id;
    this._ownerId = ownerId;
    this._name = name;
    this._description = description;
  }

  get id() {
    return this._id;
  }

  get ownerId() {
    return this._ownerId;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  isOwnedBy(userId) {
    return this._ownerId === userId;
  }

  _assertOwner(actorId) {
    if (!this.isOwnedBy(actorId)) {
      throw new ForbiddenError(
        `user ${actorId} cannot modify item ${this._id}`,
        'ITEM_FORBIDDEN'
      );
    }
  }

  rename(newName, actorId) {
    this._assertOwner(actorId);
    if (!(newName instanceof ItemName)) {
      throw new ValidationError('newName must be ItemName VO', 'ITEM_NAME_INVALID');
    }
    this._name = newName;
  }

  changeDescription(newDescription, actorId) {
    this._assertOwner(actorId);
    if (!(newDescription instanceof ItemDescription)) {
      throw new ValidationError(
        'newDescription must be ItemDescription VO',
        'ITEM_DESCRIPTION_INVALID'
      );
    }
    this._description = newDescription;
  }

  ensureCanBeDeletedBy(actorId) {
    this._assertOwner(actorId);
  }

  equals(other) {
    return other instanceof Item && other._id === this._id;
  }
}

module.exports = { Item };
