'use strict';

const { IItemReadRepository } = require('../../../application/queries/read_repositories/IItemReadRepository');
const { ItemListItemDTO, ItemDetailDTO } = require('../../../application/dto/ItemReadModels');

class InMemoryItemReadRepository extends IItemReadRepository {
  constructor({ itemsRepo, usersRepo }) {
    super();
    this._itemsStore = itemsRepo.store;
    this._usersStore = usersRepo.store;
  }

  _join(itemRecord) {
    const user = this._usersStore.get(itemRecord.owner_id);
    return {
      id: itemRecord.id,
      name: itemRecord.name,
      description: itemRecord.description ?? '',
      ownerId: itemRecord.owner_id,
      ownerUsername: user ? user.username : null,
    };
  }

  async findAll() {
    const rows = [...this._itemsStore.values()]
      .sort((a, b) => a.id - b.id)
      .map((r) => this._join(r));
    return rows.map((d) => new ItemListItemDTO(d));
  }

  async findById(id) {
    const r = this._itemsStore.get(id);
    if (!r) return null;
    return new ItemDetailDTO(this._join(r));
  }
}

module.exports = { InMemoryItemReadRepository };
