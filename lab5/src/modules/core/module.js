'use strict';

const express = require('express');

const { InMemoryUserRepository } = require('./infrastructure/persistence/memory/InMemoryUserRepository');
const { InMemoryItemRepository } = require('./infrastructure/persistence/memory/InMemoryItemRepository');
const { InMemoryItemReadRepository } = require('./infrastructure/persistence/memory/InMemoryItemReadRepository');
const { BcryptPasswordHasher } = require('./infrastructure/security/BcryptPasswordHasher');
const { JwtTokenService } = require('./infrastructure/security/JwtTokenService');

const { UserFactory } = require('./domain/user/UserFactory');
const { ItemFactory } = require('./domain/item/ItemFactory');

const { RegisterUserCommandHandler } = require('./application/commands/register_user/RegisterUserCommandHandler');
const { LoginUserCommandHandler } = require('./application/commands/login_user/LoginUserCommandHandler');
const { CreateItemCommandHandler } = require('./application/commands/create_item/CreateItemCommandHandler');
const { UpdateItemCommandHandler } = require('./application/commands/update_item/UpdateItemCommandHandler');
const { DeleteItemCommandHandler } = require('./application/commands/delete_item/DeleteItemCommandHandler');

const { ListItemsQueryHandler } = require('./application/queries/list_items/ListItemsQueryHandler');
const { GetItemQueryHandler } = require('./application/queries/get_item/GetItemQueryHandler');

const { RegisterUserCommand } = require('./application/commands/register_user/RegisterUserCommand');
const { LoginUserCommand } = require('./application/commands/login_user/LoginUserCommand');
const { CreateItemCommand } = require('./application/commands/create_item/CreateItemCommand');
const { UpdateItemCommand } = require('./application/commands/update_item/UpdateItemCommand');
const { DeleteItemCommand } = require('./application/commands/delete_item/DeleteItemCommand');
const { ListItemsQuery } = require('./application/queries/list_items/ListItemsQuery');
const { GetItemQuery } = require('./application/queries/get_item/GetItemQuery');

const { ValidationError } = require('./domain/errors/DomainError');
const { AuthenticationError } = require('./domain/errors/DomainError');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('id must be a positive integer', 'ID_INVALID');
  }
  return id;
}

function buildAuthMiddleware(tokens) {
  return function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new AuthenticationError('missing token', 'MISSING_TOKEN'));
    }
    try {
      req.user = tokens.verify(header.slice(7));
      next();
    } catch (err) {
      next(err);
    }
  };
}

function buildCoreModule({ eventBus, jwtSecret = 'change-me-in-prod' } = {}) {
  const users = new InMemoryUserRepository();
  const items = new InMemoryItemRepository();
  const itemsRead = new InMemoryItemReadRepository({ itemsRepo: items, usersRepo: users });

  const hasher = new BcryptPasswordHasher(10);
  const tokens = new JwtTokenService({ secret: jwtSecret });
  const userFactory = new UserFactory({ users, hasher });
  const itemFactory = new ItemFactory({ items });

  const commands = {
    registerUser: new RegisterUserCommandHandler({ users, userFactory, eventBus }),
    loginUser: new LoginUserCommandHandler({ users, hasher, tokens }),
    createItem: new CreateItemCommandHandler({ items, itemFactory, eventBus }),
    updateItem: new UpdateItemCommandHandler({ items, eventBus }),
    deleteItem: new DeleteItemCommandHandler({ items, eventBus }),
  };
  const queries = {
    listItems: new ListItemsQueryHandler({ itemsRead }),
    getItem: new GetItemQueryHandler({ itemsRead }),
  };

  const authRouter = express.Router();
  authRouter.post('/register', async (req, res, next) => {
    try {
      const cmd = new RegisterUserCommand({
        username: req.body?.username, password: req.body?.password,
      });
      const id = await commands.registerUser.handle(cmd);
      res.status(201).json({ id, username: cmd.username });
    } catch (err) { next(err); }
  });
  authRouter.post('/login', async (req, res, next) => {
    try {
      const cmd = new LoginUserCommand({
        username: req.body?.username, password: req.body?.password,
      });
      const token = await commands.loginUser.handle(cmd);
      res.status(200).json({ token });
    } catch (err) { next(err); }
  });

  const authMiddleware = buildAuthMiddleware(tokens);
  const itemsRouter = express.Router();
  itemsRouter.get('/', async (_req, res, next) => {
    try { res.json(await queries.listItems.handle(new ListItemsQuery())); }
    catch (err) { next(err); }
  });
  itemsRouter.get('/:id', async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      res.json(await queries.getItem.handle(new GetItemQuery({ id })));
    } catch (err) { next(err); }
  });
  itemsRouter.post('/', authMiddleware, async (req, res, next) => {
    try {
      const id = await commands.createItem.handle(new CreateItemCommand({
        name: req.body?.name, description: req.body?.description, ownerId: req.user.sub,
      }));
      res.status(201).json({ id });
    } catch (err) { next(err); }
  });
  itemsRouter.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      await commands.updateItem.handle(new UpdateItemCommand({
        id, actorId: req.user.sub, name: req.body?.name, description: req.body?.description,
      }));
      res.status(204).end();
    } catch (err) { next(err); }
  });
  itemsRouter.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      await commands.deleteItem.handle(new DeleteItemCommand({ id, actorId: req.user.sub }));
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return {
    routes: { auth: authRouter, items: itemsRouter },
    tokens,
  };
}

module.exports = { buildCoreModule };
