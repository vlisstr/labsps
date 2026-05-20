'use strict';

const express = require('express');

const {
  InMemoryUserStatsRepository,
  InMemoryDailyMetricsRepository,
} = require('./infrastructure/persistence/InMemoryAnalyticsRepositories');
const {
  registerAnalyticsSubscribers,
} = require('./application/handlers/AnalyticsEventHandler');
const {
  GetSummaryQueryHandler,
  GetUserStatsQueryHandler,
  GetDailyMetricsQueryHandler,
} = require('./application/queries/AnalyticsQueries');

function buildAnalyticsModule({ eventBus }) {
  const userStats = new InMemoryUserStatsRepository();
  const dailyMetrics = new InMemoryDailyMetricsRepository();

  registerAnalyticsSubscribers({ eventBus, userStats, dailyMetrics });

  const queries = {
    summary: new GetSummaryQueryHandler({ userStats, dailyMetrics }),
    users: new GetUserStatsQueryHandler({ userStats }),
    daily: new GetDailyMetricsQueryHandler({ dailyMetrics }),
  };

  const router = express.Router();
  router.get('/summary', async (_req, res, next) => {
    try { res.json(await queries.summary.handle()); }
    catch (err) { next(err); }
  });
  router.get('/users', async (_req, res, next) => {
    try { res.json(await queries.users.handle()); }
    catch (err) { next(err); }
  });
  router.get('/daily', async (_req, res, next) => {
    try { res.json(await queries.daily.handle()); }
    catch (err) { next(err); }
  });

  return {
    routes: { analytics: router },
    queries,
    userStats,
    dailyMetrics,
  };
}

module.exports = { buildAnalyticsModule };
