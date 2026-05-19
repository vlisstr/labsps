'use strict';

const { IItemRepository } = require('../../../domain/item/IItemRepository');
const { ItemRecord } = require('../orm/ItemRecord');
const { ItemMapper } = require('../mappers/ItemMapper');

class SqliteItemRepository extends IItemRepository {

  constructor(client) {
    super();
    this._db = client.db;
  }

  async save(item) {
    const r = ItemMapper.toRecord(item);
    this._db
      .prepare(
        `INSERT INTO items (id, name, description, owner_id)
         VALUES (@id, @name, @description, @owner_id)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           owner_id = excluded.owner_id`
      )
      .run(r);
  }

  async findById(id) {
    const row = this._db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    return row ? ItemMapper.toDomain(new ItemRecord(row)) : null;
  }

  async findAll() {
    const rows = this._db.prepare('SELECT * FROM items ORDER BY id ASC').all();
    return rows.map((row) => ItemMapper.toDomain(new ItemRecord(row)));
  }

  async deleteById(id) {
    this._db.prepare('DELETE FROM items WHERE id = ?').run(id);
  }

  async nextId() {
    const row = this._db.prepare('SELECT COALESCE(MAX(id), 0) AS m FROM items').get();
    return row.m + 1;
  }
}

module.exports = { SqliteItemRepository };
