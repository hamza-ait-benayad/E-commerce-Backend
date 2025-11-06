import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

type JwtPayloadUser = {
  userId: string;
  email: string;
  role: string;
};

function extractTokenFromHeader(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw ApiError.unauthorized('Authorization token missing');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload | string;

    const payload: JwtPayloadUser | null = typeof decoded === 'string' ? null : {
      userId: String((decoded as jwt.JwtPayload).userId),
      email: String((decoded as jwt.JwtPayload).email),
      role: String((decoded as jwt.JwtPayload).role),
    };

    if (!payload || !payload.userId) {
      throw ApiError.unauthorized('Invalid token payload');
    }

    req.user = payload;
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (allowedRoles.length === 0) {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}


