'use strict';

const { IItemRepository } = require('../../../domain/item/IItemRepository');
const { ItemMapper } = require('../mappers/ItemMapper');

class InMemoryItemRepository extends IItemRepository {
  constructor() {
    super();

    this._byId = new Map();
    this._seq = 0;
  }

  async save(item) {
    const r = ItemMapper.toRecord(item);
    this._byId.set(r.id, r);
  }

  async findById(id) {
    const r = this._byId.get(id);
    return r ? ItemMapper.toDomain(r) : null;
  }

  async deleteById(id) {
    this._byId.delete(id);
  }

  async nextId() {
    this._seq += 1;
    return this._seq;
  }

  get store() {
    return this._byId;
  }
}

module.exports = { InMemoryItemRepository };
