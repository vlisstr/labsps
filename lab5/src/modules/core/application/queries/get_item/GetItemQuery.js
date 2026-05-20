'use strict';

class GetItemQuery {
  constructor({ id }) {
    this.id = id;
    Object.freeze(this);
  }
}

module.exports = { GetItemQuery };
