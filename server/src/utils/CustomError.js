/**
 * @file Allows throwing Errors that trace back the history of an original error
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
class CustomError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);

    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\n--- Original Error Stack ---\n${originalError.stack}`;
    }
  }
}

module.exports = CustomError;