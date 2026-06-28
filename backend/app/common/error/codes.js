export const HTTP_ERROR_CODES = {
  'AE-400': 'Bad request',
  'AE-401': 'Unauthorized request',
  'AE-403': 'Forbidden request',
  'AE-404': 'Not found',
  'AE-405': 'Method not allowed',
  'AE-422': 'Unprocessable entity',
  'AE-424': 'Failed dependency',
  'AE-429': 'Too many requests',
  'AE-500': 'Internal server error',
  'AE-502': 'Bad gateway',
  'AE-503': 'Service unavailable',
  'AE-504': 'Gateway timeout',
};

export const APP_ERROR_CODES = {
  'AE-1000': 'Database error',
  'AE-1001': 'Transcription failed',
  'AE-1002': 'Integration not configured',
};

export const ERROR_CODES = {
  ...HTTP_ERROR_CODES,
  ...APP_ERROR_CODES,
};
