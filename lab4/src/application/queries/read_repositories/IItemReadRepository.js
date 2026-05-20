'use strict';

class IItemReadRepository {
  async findAll() {
    throw new Error('not implemented');
  }

  async findById(_id) {
    throw new Error('not implemented');
  }
}

module.exports = { IItemReadRepository };
