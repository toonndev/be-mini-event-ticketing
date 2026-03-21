import { IMessage } from '../message/msg-master';

export class AppError extends Error {
  code: number;
  httpStatus: number;
  description: string;

  constructor(message: IMessage, detail?: string) {
    super(message.msg);
    this.code = message.code;
    this.httpStatus = message.httpStatus;
    this.description = detail ?? message.description;
  }
}
