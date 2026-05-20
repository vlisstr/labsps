'use strict';

const { Item } = require('../../../domain/item/Item');
const { ItemName } = require('../../../domain/item/ItemName');
const { ItemDescription } = require('../../../domain/item/ItemDescription');
const { ItemRecord } = require('../orm/ItemRecord');

class ItemMapper {

  static toDomain(record) {
    return new Item({
      id: record.id,
      name: new ItemName(record.name),
      description: new ItemDescription(record.description ?? ''),
      ownerId: record.owner_id,
    });
  }

  static toRecord(item) {
    return new ItemRecord({
      id: item.id,
      name: item.name.value,
      description: item.description.isEmpty() ? null : item.description.value,
      owner_id: item.ownerId,
    });
  }
}

module.exports = { ItemMapper };
