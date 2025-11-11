import { validationResult } from "express-validator";
import { ApiError } from "../../utils/apiError";
import prisma from "../../utils/prisma";
import bcrypt from 'bcrypt';
import { logger } from "../../utils/logger";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface LoginRequestBody {
  email: string,
  password: string
}

export async function loginService(body: LoginRequestBody) {
  // manual validation responsibility is in controller
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw ApiError.notFound('invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const result = await prisma.$transaction(async (tx) => {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt
      }
    });
    return { accessToken, refreshToken };
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  };
}