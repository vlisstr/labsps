'use strict';

const { InMemoryUserRepository } = require('../persistence/memory/InMemoryUserRepository');
const { InMemoryItemRepository } = require('../persistence/memory/InMemoryItemRepository');
const { InMemoryItemReadRepository } = require('../persistence/memory/InMemoryItemReadRepository');
const { SqliteClient } = require('../persistence/sqlite/SqliteClient');
const { SqliteUserRepository } = require('../persistence/sqlite/SqliteUserRepository');
const { SqliteItemRepository } = require('../persistence/sqlite/SqliteItemRepository');
const { SqliteItemReadRepository } = require('../persistence/sqlite/SqliteItemReadRepository');
const { BcryptPasswordHasher } = require('../security/BcryptPasswordHasher');
const { JwtTokenService } = require('../security/JwtTokenService');

const { UserFactory } = require('../../domain/user/UserFactory');
const { ItemFactory } = require('../../domain/item/ItemFactory');

const { RegisterUserCommandHandler } = require('../../application/commands/register_user/RegisterUserCommandHandler');
const { LoginUserCommandHandler } = require('../../application/commands/login_user/LoginUserCommandHandler');
const { CreateItemCommandHandler } = require('../../application/commands/create_item/CreateItemCommandHandler');
const { UpdateItemCommandHandler } = require('../../application/commands/update_item/UpdateItemCommandHandler');
const { DeleteItemCommandHandler } = require('../../application/commands/delete_item/DeleteItemCommandHandler');

const { ListItemsQueryHandler } = require('../../application/queries/list_items/ListItemsQueryHandler');
const { GetItemQueryHandler } = require('../../application/queries/get_item/GetItemQueryHandler');

function buildContainer(opts = {}) {
  const persistence = opts.persistence || 'memory';

  let users;
  let items;
  let itemsRead;
  let sqliteClient = null;

  if (persistence === 'sqlite') {
    sqliteClient = new SqliteClient(opts.sqliteFile || 'lab3.db');
    users = new SqliteUserRepository(sqliteClient);
    items = new SqliteItemRepository(sqliteClient);
    itemsRead = new SqliteItemReadRepository(sqliteClient);
  } else {
    users = new InMemoryUserRepository();
    items = new InMemoryItemRepository();
    itemsRead = new InMemoryItemReadRepository({ itemsRepo: items, usersRepo: users });
  }

  const hasher = opts.hasher || new BcryptPasswordHasher(10);
  const tokens =
    opts.tokens || new JwtTokenService({ secret: opts.jwtSecret || 'change-me-in-prod' });

  const userFactory = new UserFactory({ users, hasher });
  const itemFactory = new ItemFactory({ items });

  const commands = {
    registerUser: new RegisterUserCommandHandler({ users, userFactory }),
    loginUser: new LoginUserCommandHandler({ users, hasher, tokens }),
    createItem: new CreateItemCommandHandler({ items, itemFactory }),
    updateItem: new UpdateItemCommandHandler({ items }),
    deleteItem: new DeleteItemCommandHandler({ items }),
  };

  const queries = {
    listItems: new ListItemsQueryHandler({ itemsRead }),
    getItem: new GetItemQueryHandler({ itemsRead }),
  };

  return { commands, queries, tokens, hasher, sqliteClient };
}

module.exports = { buildContainer };
