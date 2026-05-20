'use strict';

const express = require('express');
const { RegisterUserCommand } = require('../../application/commands/register_user/RegisterUserCommand');
const { LoginUserCommand } = require('../../application/commands/login_user/LoginUserCommand');

function buildAuthRouter(container) {
  const router = express.Router();
  const { registerUser, loginUser } = container.commands;

  router.post('/register', async (req, res, next) => {
    try {
      const cmd = new RegisterUserCommand({
        username: req.body?.username,
        password: req.body?.password,
      });
      const id = await registerUser.handle(cmd);
      res.status(201).json({ id, username: cmd.username });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const cmd = new LoginUserCommand({
        username: req.body?.username,
        password: req.body?.password,
      });
      const token = await loginUser.handle(cmd);
      res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAuthRouter };
