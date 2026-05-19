'use strict';

const { IUserRepository } = require('../../../domain/user/IUserRepository');
const { UserRecord } = require('../orm/UserRecord');
const { UserMapper } = require('../mappers/UserMapper');

class SqliteUserRepository extends IUserRepository {

  constructor(client) {
    super();
    this._db = client.db;
  }

  async save(user) {
    const r = UserMapper.toRecord(user);
    this._db
      .prepare(
        `INSERT INTO users (id, username, password_hash)
         VALUES (@id, @username, @password_hash)
         ON CONFLICT(id) DO UPDATE SET
           username = excluded.username,
           password_hash = excluded.password_hash`
      )
      .run(r);
  }

  async findById(id) {
    const row = this._db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? UserMapper.toDomain(new UserRecord(row)) : null;
  }

  async findByUsername(username) {
    const row = this._db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username.value);
    return row ? UserMapper.toDomain(new UserRecord(row)) : null;
  }

  async existsByUsername(username) {
    const row = this._db
      .prepare('SELECT 1 AS one FROM users WHERE username = ?')
      .get(username.value);
    return !!row;
  }

  async nextId() {
    const row = this._db.prepare('SELECT COALESCE(MAX(id), 0) AS m FROM users').get();
    return row.m + 1;
  }
}

module.exports = { SqliteUserRepository };
