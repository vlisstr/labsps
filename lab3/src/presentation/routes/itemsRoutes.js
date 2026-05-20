'use strict';

const express = require('express');
const { ValidationError } = require('../../domain/errors/DomainError');
const { CreateItemCommand } = require('../../application/commands/create_item/CreateItemCommand');
const { UpdateItemCommand } = require('../../application/commands/update_item/UpdateItemCommand');
const { DeleteItemCommand } = require('../../application/commands/delete_item/DeleteItemCommand');
const { ListItemsQuery } = require('../../application/queries/list_items/ListItemsQuery');
const { GetItemQuery } = require('../../application/queries/get_item/GetItemQuery');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('id must be a positive integer', 'ID_INVALID');
  }
  return id;
}

function buildItemsRouter({ commands, queries, authMiddleware }) {
  const router = express.Router();

  router.get('/', async (_req, res, next) => {
    try {
      const result = await queries.listItems.handle(new ListItemsQuery());
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      const result = await queries.getItem.handle(new GetItemQuery({ id }));
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const cmd = new CreateItemCommand({
        name: req.body?.name,
        description: req.body?.description,
        ownerId: req.user.sub,
      });
      const id = await commands.createItem.handle(cmd);
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      await commands.updateItem.handle(new UpdateItemCommand({
        id,
        actorId: req.user.sub,
        name: req.body?.name,
        description: req.body?.description,
      }));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      await commands.deleteItem.handle(new DeleteItemCommand({ id, actorId: req.user.sub }));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildItemsRouter };
