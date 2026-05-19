'use strict';

const { User } = require('../../../domain/user/User');
const { Username } = require('../../../domain/user/Username');
const { PasswordHash } = require('../../../domain/user/PasswordHash');
const { UserRecord } = require('../orm/UserRecord');

class UserMapper {

  static toDomain(record) {
    return new User({
      id: record.id,
      username: new Username(record.username),
      passwordHash: new PasswordHash(record.password_hash),
    });
  }

  static toRecord(user) {
    return new UserRecord({
      id: user.id,
      username: user.username.value,
      password_hash: user.passwordHash.value,
    });
  }
}

module.exports = { UserMapper };
