'use strict';

class UserRegistered {
  constructor({ userId, username, occurredAt }) {
    this.type = 'UserRegistered';
    this.userId = userId;
    this.username = username;
    this.occurredAt = occurredAt;
    Object.freeze(this);
  }
}

module.exports = { UserRegistered };
