'use strict';

class IUserStatsRepository {
  async findOrCreate(_userId, _username) {
    throw new Error('not implemented');
  }
  async save(_stats) {
    throw new Error('not implemented');
  }
  async findById(_userId) {
    throw new Error('not implemented');
  }
  async findAll() {
    throw new Error('not implemented');
  }
}

class IDailyMetricsRepository {
  async findOrCreate(_date) {
    throw new Error('not implemented');
  }
  async save(_metric) {
    throw new Error('not implemented');
  }
  async findAll() {
    throw new Error('not implemented');
  }
}

module.exports = { IUserStatsRepository, IDailyMetricsRepository };
