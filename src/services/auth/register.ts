import { ApiError } from '../../utils/apiError';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import { env } from "../../config/env";
import jwt from "jsonwebtoken";
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

export async function registerService(body: RegisterRequestBody) {
  const { email, password, name } = body;
  // The controller must validate required fields and uniqueness, do not duplicate here.
  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, name, role: 'CUSTOMER' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions,
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions,
      );
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await tx.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt },
      });
      return { user, accessToken, refreshToken };
    });
    logger.info(`New user registered: ${result.user.email}`, {
      userId: result.user.id,
      email: result.user.email,
    });
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw ApiError.conflict('User with this email already exists');
    }
    throw error;
  }
}