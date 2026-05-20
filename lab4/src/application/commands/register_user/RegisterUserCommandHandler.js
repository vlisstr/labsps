'use strict';

const { AuditEntry } = require('../../../audit/AuditEntry');
const { UserRegistered } = require('../../events/UserRegistered');

class RegisterUserCommandHandler {
  constructor({ users, userFactory, mode, auditLogger, eventBus }) {
    this._users = users;
    this._userFactory = userFactory;
    this._mode = mode || 'sync';
    this._auditLogger = auditLogger || null;
    this._eventBus = eventBus || null;
  }

  async handle(command) {
    const user = await this._userFactory.create({
      username: command.username,
      password: command.password,
    });
    await this._users.save(user);

    const occurredAt = new Date().toISOString();

    if (this._mode === 'sync' && this._auditLogger) {
      try {
        await this._auditLogger.record(new AuditEntry({
          action: 'user.registered',
          entityType: 'user',
          entityId: user.id,
          actorId: user.id,
          details: { username: user.username.value },
          occurredAt,
        }));
      } catch (err) {
        console.error('[sync] audit failed, ignoring:', err.message);
      }
    } else if (this._mode === 'async' && this._eventBus) {
      await this._eventBus.publish(new UserRegistered({
        userId: user.id,
        username: user.username.value,
        occurredAt,
      }));
    }

    return user.id;
  }
}

module.exports = { RegisterUserCommandHandler };
