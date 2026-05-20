'use strict';

class IUserRepository {

  async save(_user) {
    throw new Error('not implemented');
  }

  async findById(_id) {
    throw new Error('not implemented');
  }

  async findByUsername(_username) {
    throw new Error('not implemented');
  }

  async existsByUsername(_username) {
    throw new Error('not implemented');
  }

  async nextId() {
    throw new Error('not implemented');
  }
}

module.exports = { IUserRepository };
