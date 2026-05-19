'use strict';

const { userToView } = require('../dto/views');

class RegisterUserUseCase {

  constructor({ users, userFactory }) {
    this._users = users;
    this._userFactory = userFactory;
  }

  async execute({ username, password }) {
    const user = await this._userFactory.create({ username, password });
    await this._users.save(user);
    return userToView(user);
  }
}

module.exports = { RegisterUserUseCase };
