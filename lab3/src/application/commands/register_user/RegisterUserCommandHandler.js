'use strict';

class RegisterUserCommandHandler {
  constructor({ users, userFactory }) {
    this._users = users;
    this._userFactory = userFactory;
  }

  async handle(command) {
    const user = await this._userFactory.create({
      username: command.username,
      password: command.password,
    });
    await this._users.save(user);
    return user.id;
  }
}

module.exports = { RegisterUserCommandHandler };
