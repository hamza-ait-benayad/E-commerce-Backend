import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
      role: string;
    }
    interface Request {
      sessionId?: string;
      user?: UserPayload;
    }
  }
}

export {};


