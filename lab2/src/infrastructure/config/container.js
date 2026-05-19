'use strict';

const { InMemoryUserRepository } = require('../persistence/memory/InMemoryUserRepository');
const { InMemoryItemRepository } = require('../persistence/memory/InMemoryItemRepository');
const { SqliteClient } = require('../persistence/sqlite/SqliteClient');
const { SqliteUserRepository } = require('../persistence/sqlite/SqliteUserRepository');
const { SqliteItemRepository } = require('../persistence/sqlite/SqliteItemRepository');
const { BcryptPasswordHasher } = require('../security/BcryptPasswordHasher');
const { JwtTokenService } = require('../security/JwtTokenService');

const { UserFactory } = require('../../domain/user/UserFactory');
const { ItemFactory } = require('../../domain/item/ItemFactory');

const { RegisterUserUseCase } = require('../../application/use_cases/RegisterUserUseCase');
const { LoginUserUseCase } = require('../../application/use_cases/LoginUserUseCase');
const { ListItemsUseCase } = require('../../application/use_cases/ListItemsUseCase');
const { GetItemUseCase } = require('../../application/use_cases/GetItemUseCase');
const { CreateItemUseCase } = require('../../application/use_cases/CreateItemUseCase');
const { UpdateItemUseCase } = require('../../application/use_cases/UpdateItemUseCase');
const { DeleteItemUseCase } = require('../../application/use_cases/DeleteItemUseCase');

function buildContainer(opts = {}) {
  const persistence = opts.persistence || 'memory';

  let users;
  let items;
  let sqliteClient = null;

  if (persistence === 'sqlite') {
    sqliteClient = new SqliteClient(opts.sqliteFile || 'lab2.db');
    users = new SqliteUserRepository(sqliteClient);
    items = new SqliteItemRepository(sqliteClient);
  } else {
    users = new InMemoryUserRepository();
    items = new InMemoryItemRepository();
  }

  const hasher = opts.hasher || new BcryptPasswordHasher(10);
  const tokens =
    opts.tokens ||
    new JwtTokenService({ secret: opts.jwtSecret || 'change-me-in-prod' });

  const userFactory = new UserFactory({ users, hasher });
  const itemFactory = new ItemFactory({ items });

  const useCases = {
    registerUser: new RegisterUserUseCase({ users, userFactory }),
    loginUser: new LoginUserUseCase({ users, hasher, tokens }),
    listItems: new ListItemsUseCase({ items }),
    getItem: new GetItemUseCase({ items }),
    createItem: new CreateItemUseCase({ items, itemFactory }),
    updateItem: new UpdateItemUseCase({ items }),
    deleteItem: new DeleteItemUseCase({ items }),
  };

  return { useCases, tokens, hasher, sqliteClient };
}

module.exports = { buildContainer };
