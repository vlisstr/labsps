'use strict';

class GetSummaryQueryHandler {
  constructor({ userStats, dailyMetrics }) {
    this._userStats = userStats;
    this._dailyMetrics = dailyMetrics;
  }

  async handle() {
    const allStats = await this._userStats.findAll();
    const allMetrics = await this._dailyMetrics.findAll();
    return {
      totalUsers: allStats.length,
      totalItemsCreated: allStats.reduce((s, u) => s + u.itemsCreated, 0),
      totalItemsDeleted: allStats.reduce((s, u) => s + u.itemsDeleted, 0),
      totalActiveItems: allStats.reduce((s, u) => s + u.activeItems, 0),
      days: allMetrics.length,
    };
  }
}

class GetUserStatsQueryHandler {
  constructor({ userStats }) {
    this._userStats = userStats;
  }

  async handle() {
    const all = await this._userStats.findAll();
    return all
      .map((u) => ({
        userId: u.userId,
        username: u.username,
        itemsCreated: u.itemsCreated,
        itemsDeleted: u.itemsDeleted,
        activeItems: u.activeItems,
        lastActivityAt: u.lastActivityAt,
      }))
      .sort((a, b) => b.activeItems - a.activeItems);
  }
}

class GetDailyMetricsQueryHandler {
  constructor({ dailyMetrics }) {
    this._dailyMetrics = dailyMetrics;
  }

  async handle() {
    const all = await this._dailyMetrics.findAll();
    return all.map((m) => ({
      date: m.date,
      registrations: m.registrations,
      itemsCreated: m.itemsCreated,
      itemsUpdated: m.itemsUpdated,
      itemsDeleted: m.itemsDeleted,
    }));
  }
}

module.exports = {
  GetSummaryQueryHandler,
  GetUserStatsQueryHandler,
  GetDailyMetricsQueryHandler,
};
