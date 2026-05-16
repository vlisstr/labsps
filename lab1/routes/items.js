const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const items = [];

router.get('/', (req, res) => {
  res.json(items);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

router.post('/', authenticate, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const item = { id: items.length + 1, name, description: description || '', ownerId: req.user.sub };
  items.push(item);
  res.status(201).json(item);
});

router.put('/:id', authenticate, (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'not found' });
  if (item.ownerId !== req.user.sub) return res.status(403).json({ error: 'forbidden' });
  const { name, description } = req.body;
  if (name) item.name = name;
  if (description) item.description = description;
  res.json(item);
});

router.delete('/:id', authenticate, (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const item = items[idx];
  if (item.ownerId !== req.user.sub) return res.status(403).json({ error: 'forbidden' });
  items.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
