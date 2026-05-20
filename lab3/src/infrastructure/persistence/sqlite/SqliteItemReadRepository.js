'use strict';

const { IItemReadRepository } = require('../../../application/queries/read_repositories/IItemReadRepository');
const { ItemListItemDTO, ItemDetailDTO } = require('../../../application/dto/ItemReadModels');

class SqliteItemReadRepository extends IItemReadRepository {
  constructor(client) {
    super();
    this._db = client.db;
  }

  async findAll() {
    const rows = this._db
      .prepare(
        `SELECT i.id, i.name, i.description, i.owner_id, u.username AS owner_username
         FROM items i
         LEFT JOIN users u ON u.id = i.owner_id
         ORDER BY i.id ASC`
      )
      .all();
    return rows.map(
      (r) =>
        new ItemListItemDTO({
          id: r.id,
          name: r.name,
          description: r.description ?? '',
          ownerId: r.owner_id,
          ownerUsername: r.owner_username,
        })
    );
  }

  async findById(id) {
    const r = this._db
      .prepare(
        `SELECT i.id, i.name, i.description, i.owner_id, u.username AS owner_username
         FROM items i
         LEFT JOIN users u ON u.id = i.owner_id
         WHERE i.id = ?`
      )
      .get(id);
    if (!r) return null;
    return new ItemDetailDTO({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      ownerId: r.owner_id,
      ownerUsername: r.owner_username,
    });
  }
}

module.exports = { SqliteItemReadRepository };
