/*
  Uses `as const` instead of enum as suggested by 
  Matt Pocock on "Enums considered harmful" 
  video: https://www.youtube.com/watch?v=jjMbPt_H3RQ 

  Usage:

  function handleError(errorCode: ErrorCode) {
    console.log(ERROR_CODE[errorCode]);
  }

  handleError(ERROR_CODE.API_ERROR);
*/

export const ERROR_CODE = {
  API_ERROR: 'ERR_API_ERROR',
  NOT_FOUND: 'ERR_NOT_FOUND',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  INVALID_TOKEN: 'ERR_INVALID_TOKEN',
  INVALID_FILE: 'ERR_INVALID_FILE',
  INVALID_FILE_SIZE: 'ERR_INVALID_FILE_SIZE',
  INVALID_FILE_TYPE: 'ERR_INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'ERR_UPLOAD_FAILED',
  INTERNAL_SERVER_ERROR: 'ERR_INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODE;
