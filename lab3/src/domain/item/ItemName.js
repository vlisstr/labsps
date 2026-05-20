'use strict';

const { ValidationError } = require('../errors/DomainError');

class ItemName {
  static MIN_LEN = 1;
  static MAX_LEN = 120;

  constructor(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('item name must be a string', 'ITEM_NAME_INVALID');
    }
    const v = value.trim();
    if (v.length < ItemName.MIN_LEN || v.length > ItemName.MAX_LEN) {
      throw new ValidationError(
        `item name length must be ${ItemName.MIN_LEN}–${ItemName.MAX_LEN}`,
        'ITEM_NAME_INVALID'
      );
    }
    this._value = v;
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof ItemName && other._value === this._value;
  }

  toString() {
    return this._value;
  }
}

module.exports = { ItemName };
