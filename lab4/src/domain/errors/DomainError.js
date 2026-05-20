'use strict';

class DomainError extends Error {

  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name;
  }
}

class ValidationError extends DomainError {}

class ConflictError extends DomainError {}

class NotFoundError extends DomainError {}

class ForbiddenError extends DomainError {}

class AuthenticationError extends DomainError {}

module.exports = {
  DomainError,
  ValidationError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  AuthenticationError,
};
