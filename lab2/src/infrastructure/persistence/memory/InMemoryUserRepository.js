'use strict';

const { IUserRepository } = require('../../../domain/user/IUserRepository');
const { UserMapper } = require('../mappers/UserMapper');

class InMemoryUserRepository extends IUserRepository {
  constructor() {
    super();

    this._byId = new Map();

    this._idByUsername = new Map();
    this._seq = 0;
  }

  async save(user) {
    const record = UserMapper.toRecord(user);
    this._byId.set(record.id, record);
    this._idByUsername.set(record.username, record.id);
  }

  async findById(id) {
    const r = this._byId.get(id);
    return r ? UserMapper.toDomain(r) : null;
  }

  async findByUsername(username) {
    const id = this._idByUsername.get(username.value);
    if (id == null) return null;
    const r = this._byId.get(id);
    return r ? UserMapper.toDomain(r) : null;
  }

  async existsByUsername(username) {
    return this._idByUsername.has(username.value);
  }

  async nextId() {
    this._seq += 1;
    return this._seq;
  }
}

module.exports = { InMemoryUserRepository };
