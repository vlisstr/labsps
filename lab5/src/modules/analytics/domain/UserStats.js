'use strict';

class UserStats {
  constructor({ userId, username }) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('UserStats.userId must be positive integer');
    }
    this._userId = userId;
    this._username = username;
    this._itemsCreated = 0;
    this._itemsDeleted = 0;
    this._lastActivityAt = null;
  }

  get userId() { return this._userId; }
  get username() { return this._username; }
  get itemsCreated() { return this._itemsCreated; }
  get itemsDeleted() { return this._itemsDeleted; }
  get activeItems() { return this._itemsCreated - this._itemsDeleted; }
  get lastActivityAt() { return this._lastActivityAt; }

  recordItemCreated(occurredAt) {
    this._itemsCreated += 1;
    this._lastActivityAt = occurredAt;
  }

  recordItemDeleted(occurredAt) {
    this._itemsDeleted += 1;
    this._lastActivityAt = occurredAt;
  }

  recordRegistered(occurredAt) {
    this._lastActivityAt = occurredAt;
  }
}

module.exports = { UserStats };
