'use strict';

function dateOf(occurredAt) {
  return occurredAt.slice(0, 10);
}

class CoreEventTranslator {
  static toUserStatsUpdate(event) {
    switch (event.type) {
      case 'UserRegistered':
        return {
          userId: event.userId,
          username: event.username,
          apply: (stats) => stats.recordRegistered(event.occurredAt),
        };
      case 'ItemCreated':
        return {
          userId: event.ownerId,
          username: null,
          apply: (stats) => stats.recordItemCreated(event.occurredAt),
        };
      case 'ItemDeleted':
        return {
          userId: event.actorId,
          username: null,
          apply: (stats) => stats.recordItemDeleted(event.occurredAt),
        };
      default:
        return null;
    }
  }

  static toDailyMetricUpdate(event) {
    if (!event || !event.occurredAt) return null;
    const date = dateOf(event.occurredAt);
    switch (event.type) {
      case 'UserRegistered':
        return { date, apply: (m) => m.incRegistrations() };
      case 'ItemCreated':
        return { date, apply: (m) => m.incItemsCreated() };
      case 'ItemUpdated':
        return { date, apply: (m) => m.incItemsUpdated() };
      case 'ItemDeleted':
        return { date, apply: (m) => m.incItemsDeleted() };
      default:
        return null;
    }
  }
}

module.exports = { CoreEventTranslator };
