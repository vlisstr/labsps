'use strict';

const { CoreEventTranslator } = require('../../infrastructure/acl/CoreEventTranslator');

function makeAnalyticsEventHandler({ userStats, dailyMetrics }) {
  return async function handle(event) {
    const statsUpdate = CoreEventTranslator.toUserStatsUpdate(event);
    if (statsUpdate) {
      const existing = await userStats.findById(statsUpdate.userId);
      const stats = existing
        ? existing
        : await userStats.findOrCreate(
            statsUpdate.userId,
            statsUpdate.username || `user#${statsUpdate.userId}`
          );
      statsUpdate.apply(stats);
      await userStats.save(stats);
    }

    const metricUpdate = CoreEventTranslator.toDailyMetricUpdate(event);
    if (metricUpdate) {
      const metric = await dailyMetrics.findOrCreate(metricUpdate.date);
      metricUpdate.apply(metric);
      await dailyMetrics.save(metric);
    }
  };
}

function registerAnalyticsSubscribers({ eventBus, userStats, dailyMetrics }) {
  const handler = makeAnalyticsEventHandler({ userStats, dailyMetrics });
  for (const type of ['UserRegistered', 'ItemCreated', 'ItemUpdated', 'ItemDeleted']) {
    eventBus.subscribe(type, handler);
  }
}

module.exports = { makeAnalyticsEventHandler, registerAnalyticsSubscribers };
