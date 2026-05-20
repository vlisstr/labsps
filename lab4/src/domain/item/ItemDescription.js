'use strict';

const { ValidationError } = require('../errors/DomainError');

class ItemDescription {
  static MAX_LEN = 2000;

  constructor(value) {
    if (value == null) value = '';
    if (typeof value !== 'string') {
      throw new ValidationError('description must be a string', 'ITEM_DESCRIPTION_INVALID');
    }
    if (value.length > ItemDescription.MAX_LEN) {
      throw new ValidationError(
        `description length must be ≤ ${ItemDescription.MAX_LEN}`,
        'ITEM_DESCRIPTION_INVALID'
      );
    }
    this._value = value;
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  isEmpty() {
    return this._value.length === 0;
  }

  equals(other) {
    return other instanceof ItemDescription && other._value === this._value;
  }

  toString() {
    return this._value;
  }
}

module.exports = { ItemDescription };
