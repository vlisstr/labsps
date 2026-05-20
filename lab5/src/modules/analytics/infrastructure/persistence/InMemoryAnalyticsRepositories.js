'use strict';

const {
  IUserStatsRepository,
  IDailyMetricsRepository,
} = require('../../application/ports/IAnalyticsRepositories');
const { UserStats } = require('../../domain/UserStats');
const { DailyMetric } = require('../../domain/DailyMetric');

class InMemoryUserStatsRepository extends IUserStatsRepository {
  constructor() {
    super();
    this._byId = new Map();
  }

  async findOrCreate(userId, username) {
    if (!this._byId.has(userId)) {
      this._byId.set(userId, new UserStats({ userId, username }));
    }
    return this._byId.get(userId);
  }

  async save(stats) {
    this._byId.set(stats.userId, stats);
  }

  async findById(userId) {
    return this._byId.get(userId) || null;
  }

  async findAll() {
    return [...this._byId.values()];
  }
}

class InMemoryDailyMetricsRepository extends IDailyMetricsRepository {
  constructor() {
    super();
    this._byDate = new Map();
  }

  async findOrCreate(date) {
    if (!this._byDate.has(date)) {
      this._byDate.set(date, new DailyMetric({ date }));
    }
    return this._byDate.get(date);
  }

  async save(metric) {
    this._byDate.set(metric.date, metric);
  }

  async findAll() {
    return [...this._byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}

module.exports = { InMemoryUserStatsRepository, InMemoryDailyMetricsRepository };
