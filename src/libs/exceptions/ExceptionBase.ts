export interface SerializedException {
  message: string;
  code: string;
  stack?: string;
  cause?: string;
}

export abstract class ExceptionBase extends Error {
  abstract code: string;

  constructor(
    readonly message: string,
    readonly cause: Error,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}