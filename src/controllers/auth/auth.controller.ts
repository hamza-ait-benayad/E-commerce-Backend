import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { loginService, registerService } from '../../services/authService';
import { ApiError } from '../../utils/apiError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(errors.array()[0].msg);
    }
    const result = await loginService(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successfully',
      data: result,
    });
  } catch (error: any) {
    next(error instanceof ApiError ? error : ApiError.internal(error.message));
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(errors.array()[0].msg);
    }
    const result = await registerService(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error: any) {
    next(error instanceof ApiError ? error : ApiError.internal(error.message));
  }
};
