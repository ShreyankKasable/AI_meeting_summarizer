import { ERROR_CODES } from './codes.js';

const DEFAULT_ERROR = {
  code: 'AE-500',
  message: 'Oops, something went wrong on our end!',
  statusCode: 500,
};

export class AppError extends Error {
  constructor (
    message = DEFAULT_ERROR.message,
    code = DEFAULT_ERROR.code,
    statusCode = DEFAULT_ERROR.statusCode,
    errors = []
  ) {
    super(ERROR_CODES[code] || message);
    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createErrorClass = (code) => class CustomAppError extends AppError {
  constructor (message, errors) {
    let statusCode;
    if (code.startsWith('HE-')) statusCode = parseInt(code.split('-')[1], 10);
    super(message, `AE-${code.split('-')[1]}`, statusCode ?? 500, errors);
  }
};

export const BadRequest = createErrorClass('HE-400');
export const UnauthorizedRequest = createErrorClass('HE-401');
export const ForbiddenRequest = createErrorClass('HE-403');
export const NotFound = createErrorClass('HE-404');
export const MethodNotAllowed = createErrorClass('HE-405');
export const UnprocessableEntity = createErrorClass('HE-422');
export const FailedDependency = createErrorClass('HE-424');
export const TooManyRequests = createErrorClass('HE-429');
export const InternalServerError = createErrorClass('HE-500');
export const BadGateway = createErrorClass('HE-502');
export const ServiceUnavailable = createErrorClass('HE-503');

export class ValidationError extends BadRequest {
  constructor (message, errors = []) {
    super(message ?? 'validation error');
    this.errors = errors;
  }
}
