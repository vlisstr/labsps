'use strict';

const { IPasswordHasher } = require('../../src/domain/ports/IPasswordHasher');
const { ITokenService } = require('../../src/domain/ports/ITokenService');
const { IUserRepository } = require('../../src/domain/user/IUserRepository');
const { IItemRepository } = require('../../src/domain/item/IItemRepository');

class FakePasswordHasher extends IPasswordHasher {
  async hash(plain) {
    return `hashed::${plain}::xxxxxxxxxxxxxxxxxxxx`;
  }
  async verify(plain, hashed) {
    return hashed === `hashed::${plain}::xxxxxxxxxxxxxxxxxxxx`;
  }
}

class FakeTokenService extends ITokenService {
  issue(claims) {
    return `tok::${claims.sub}::${claims.username}`;
  }
  verify(token) {
    if (typeof token !== 'string' || !token.startsWith('tok::')) {
      const { AuthenticationError } = require('../../src/domain/errors/DomainError');
      throw new AuthenticationError('bad token', 'INVALID_TOKEN');
    }
    const [, sub, username] = token.split('::');
    return { sub: Number(sub), username };
  }
}

class FakeUserRepository extends IUserRepository {
  constructor() {
    super();

    this._byId = new Map();
    this._seq = 0;
  }
  async save(user) {
    this._byId.set(user.id, user);
  }
  async findById(id) {
    return this._byId.get(id) || null;
  }
  async findByUsername(username) {
    for (const u of this._byId.values()) {
      if (u.username.value === username.value) return u;
    }
    return null;
  }
  async existsByUsername(username) {
    return (await this.findByUsername(username)) !== null;
  }
  async nextId() {
    this._seq += 1;
    return this._seq;
  }
}

class FakeItemRepository extends IItemRepository {
  constructor() {
    super();

    this._byId = new Map();
    this._seq = 0;
  }
  async save(item) {
    this._byId.set(item.id, item);
  }
  async findById(id) {
    return this._byId.get(id) || null;
  }
  async findAll() {
    return [...this._byId.values()];
  }
  async deleteById(id) {
    this._byId.delete(id);
  }
  async nextId() {
    this._seq += 1;
    return this._seq;
  }
}

module.exports = {
  FakePasswordHasher,
  FakeTokenService,
  FakeUserRepository,
  FakeItemRepository,
};
