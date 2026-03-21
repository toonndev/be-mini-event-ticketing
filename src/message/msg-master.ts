export interface IMessage {
  msg: string;
  code: number;
  httpStatus: number;
  description: string;
}

export const MSG_MASTER: { [key: string]: IMessage } = {
  // 1xxx: Success
  SUCCESS: {
    msg: 'SUCCESS',
    code: 1000,
    httpStatus: 200,
    description: 'Success',
  },
  CREATE_SUCCESS: {
    msg: 'CREATE_SUCCESS',
    code: 1000,
    httpStatus: 201,
    description: 'Creation successful',
  },
  UPDATE_SUCCESS: {
    msg: 'UPDATE_SUCCESS',
    code: 1000,
    httpStatus: 200,
    description: 'Data successfully updated',
  },
  DELETE_SUCCESS: {
    msg: 'DELETE_SUCCESS',
    code: 1000,
    httpStatus: 204,
    description: 'Data successfully deleted',
  },

  // 11xx: Client Errors
  INVALID_PARAMETERS: {
    msg: 'INVALID_PARAMETERS',
    code: 1102,
    httpStatus: 400,
    description: 'Invalid parameters entered',
  },
  NOT_FOUND: {
    msg: 'NOT_FOUND',
    code: 1104,
    httpStatus: 404,
    description: 'Requested entity record does not exist',
  },
  DUPLICATE_ENTRY: {
    msg: 'DUPLICATE_ENTRY',
    code: 1111,
    httpStatus: 409,
    description: 'Data entry duplicated with existing record',
  },

  // 9xxx: Security
  AUTH_CREDENTIALS_MISSING: {
    msg: 'AUTH_CREDENTIALS_MISSING',
    code: 9100,
    httpStatus: 401,
    description: 'Missing required authorization credentials',
  },
  INVALID_AUTH_CREDENTIALS: {
    msg: 'INVALID_AUTH_CREDENTIALS',
    code: 9500,
    httpStatus: 401,
    description: 'Invalid authorization credentials',
  },
  INVALID_ACCESS_RIGHTS: {
    msg: 'INVALID_ACCESS_RIGHTS',
    code: 9503,
    httpStatus: 403,
    description: 'Invalid access rights',
  },

  // 5xxx: Server Errors
  GENERIC_SERVER_ERROR: {
    msg: 'GENERIC_SERVER_ERROR',
    code: 5000,
    httpStatus: 500,
    description: 'Internal server error',
  },
};
