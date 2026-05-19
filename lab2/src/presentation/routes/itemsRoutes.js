'use strict';

const express = require('express');
const { ValidationError } = require('../../domain/errors/DomainError');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('id must be a positive integer', 'ID_INVALID');
  }
  return id;
}

function buildItemsRouter({ useCases, authMiddleware }) {
  const router = express.Router();
  const { listItems, getItem, createItem, updateItem, deleteItem } = useCases;

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await listItems.execute());
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      res.json(await getItem.execute({ id }));
    } catch (err) {
      next(err);
    }
  });

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const view = await createItem.execute({
        name: req.body?.name,
        description: req.body?.description,
        ownerId: req.user.sub,
      });
      res.status(201).json(view);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      const view = await updateItem.execute({
        id,
        actorId: req.user.sub,
        name: req.body?.name,
        description: req.body?.description,
      });
      res.json(view);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      await deleteItem.execute({ id, actorId: req.user.sub });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildItemsRouter };
