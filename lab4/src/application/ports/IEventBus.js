'use strict';

class IEventBus {
  subscribe(_eventType, _handler) {
    throw new Error('not implemented');
  }

  async publish(_event) {
    throw new Error('not implemented');
  }
}

module.exports = { IEventBus };
