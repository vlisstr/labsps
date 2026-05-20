'use strict';

const { IEventBus } = require('./IEventBus');

class InProcessEventBus extends IEventBus {
  constructor({ logger } = {}) {
    super();
    this._handlers = new Map();
    this._logger = logger || console;
  }

  subscribe(eventType, handler) {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function');
    }
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, []);
    }
    this._handlers.get(eventType).push(handler);
  }

  async publish(event) {
    const type = event && event.type ? event.type : null;
    if (!type) return;
    const handlers = this._handlers.get(type) || [];
    for (const h of handlers) {
      try {
        await h(event);
      } catch (err) {
        this._logger.error(`[event_bus] subscriber for ${type} failed:`, err.message);
      }
    }
  }
}

module.exports = { InProcessEventBus };
