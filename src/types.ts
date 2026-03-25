import { Request, Response } from 'express';

export interface EmailRequest extends Request {
  body: {
    email: string;
    subject?: string;
    msg?: string;
    body?: string;
  };
}

export interface EmailResponse extends Response {
  json(data: { success: boolean; message: string; messageId?: string }): this;
  send(data: string | { success: boolean; message: string }): this;
}

export interface EnvironmentVariables {
  USER_EMAIL?: string;
  USER_PASS?: string;
  MAIN_EMAIL?: string;
}

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}
