'use strict';

class IItemRepository {

  async save(_item) {
    throw new Error('not implemented');
  }

  async findById(_id) {
    throw new Error('not implemented');
  }

  async findAll() {
    throw new Error('not implemented');
  }

  async deleteById(_id) {
    throw new Error('not implemented');
  }

  async nextId() {
    throw new Error('not implemented');
  }
}

module.exports = { IItemRepository };
