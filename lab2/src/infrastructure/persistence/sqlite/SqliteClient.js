'use strict';

let Database;
try {

  Database = require('better-sqlite3');
} catch (_err) {
  Database = null;
}

class SqliteClient {

  constructor(filename) {
    if (!Database) {
      throw new Error(
        'better-sqlite3 is not installed. Run `npm install` or use the in-memory profile.'
      );
    }
    this.db = new Database(filename);
    this.db.pragma('journal_mode = WAL');
    this._migrate();
  }

  _migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS items (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT,
        owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
    `);
  }

  close() {
    this.db.close();
  }
}

module.exports = { SqliteClient };
