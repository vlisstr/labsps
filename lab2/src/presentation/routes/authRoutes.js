'use strict';

const express = require('express');

function buildAuthRouter(container) {
  const router = express.Router();
  const { registerUser, loginUser } = container.useCases;

  router.post('/register', async (req, res, next) => {
    try {
      const view = await registerUser.execute({
        username: req.body?.username,
        password: req.body?.password,
      });
      res.status(201).json(view);
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const view = await loginUser.execute({
        username: req.body?.username,
        password: req.body?.password,
      });
      res.status(200).json(view);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAuthRouter };
