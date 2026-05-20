'use strict';

class DailyMetric {
  constructor({ date }) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('DailyMetric.date must be YYYY-MM-DD');
    }
    this._date = date;
    this._registrations = 0;
    this._itemsCreated = 0;
    this._itemsDeleted = 0;
    this._itemsUpdated = 0;
  }

  get date() { return this._date; }
  get registrations() { return this._registrations; }
  get itemsCreated() { return this._itemsCreated; }
  get itemsDeleted() { return this._itemsDeleted; }
  get itemsUpdated() { return this._itemsUpdated; }

  incRegistrations() { this._registrations += 1; }
  incItemsCreated() { this._itemsCreated += 1; }
  incItemsDeleted() { this._itemsDeleted += 1; }
  incItemsUpdated() { this._itemsUpdated += 1; }
}

module.exports = { DailyMetric };
