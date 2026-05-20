'use strict';

const { UserRegistered } = require('../../events/UserRegistered');

class RegisterUserCommandHandler {
  constructor({ users, userFactory, eventBus }) {
    this._users = users;
    this._userFactory = userFactory;
    this._eventBus = eventBus;
  }

  async handle(command) {
    const user = await this._userFactory.create({
      username: command.username,
      password: command.password,
    });
    await this._users.save(user);

    if (this._eventBus) {
      await this._eventBus.publish(new UserRegistered({
        userId: user.id,
        username: user.username.value,
        occurredAt: new Date().toISOString(),
      }));
    }

    return user.id;
  }
}

module.exports = { RegisterUserCommandHandler };
