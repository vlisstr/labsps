'use strict';

const { IPasswordHasher } = require('../../src/domain/ports/IPasswordHasher');
const { ITokenService } = require('../../src/domain/ports/ITokenService');
const { IUserRepository } = require('../../src/domain/user/IUserRepository');
const { IItemRepository } = require('../../src/domain/item/IItemRepository');
const { IItemReadRepository } = require('../../src/application/queries/read_repositories/IItemReadRepository');
const { ItemListItemDTO, ItemDetailDTO } = require('../../src/application/dto/ItemReadModels');

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
  async deleteById(id) {
    this._byId.delete(id);
  }
  async nextId() {
    this._seq += 1;
    return this._seq;
  }
}

class FakeItemReadRepository extends IItemReadRepository {
  constructor() {
    super();
    this._rows = [];
  }
  seed(rows) {
    this._rows = rows;
  }
  async findAll() {
    return this._rows.map((r) => new ItemListItemDTO(r));
  }
  async findById(id) {
    const r = this._rows.find((row) => row.id === id);
    return r ? new ItemDetailDTO(r) : null;
  }
}

module.exports = {
  FakePasswordHasher,
  FakeTokenService,
  FakeUserRepository,
  FakeItemRepository,
  FakeItemReadRepository,
};

const { IEventBus } = require('../../src/application/ports/IEventBus');
const { IAuditLogger } = require('../../src/application/ports/IAuditLogger');

class CapturingEventBus extends IEventBus {
  constructor() {
    super();
    this.published = [];
    this._subs = new Map();
  }
  subscribe(eventType, handler) {
    if (!this._subs.has(eventType)) this._subs.set(eventType, []);
    this._subs.get(eventType).push(handler);
  }
  async publish(event) {
    this.published.push(event);
    const handlers = this._subs.get(event.type) || [];
    for (const h of handlers) await h(event);
  }
}

class FailingAuditLogger extends IAuditLogger {
  async record(_entry) {
    throw new Error('audit storage unavailable');
  }
  async findAll() {
    return [];
  }
}

module.exports.CapturingEventBus = CapturingEventBus;
module.exports.FailingAuditLogger = FailingAuditLogger;
