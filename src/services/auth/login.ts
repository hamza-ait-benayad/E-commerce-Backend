import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { ApiError } from "../../utils/apiError"
import prisma from "../../utils/prisma"
import bcrypt from 'bcrypt'
import { logger } from "../../utils/logger"
import { Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"
import { env } from "../../config/env"

interface LoginRequestBody {
  email: string,
  password: string
}

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
      throw ApiError.badRequest(errors.array()[0].msg)
    }

    const { email, password } = req.body

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
    })

    if (!user) {
      return next(ApiError.notFound('invalid email or password'))
    }


    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return next(ApiError.unauthorized("Invalid email or password"))
    }

    const result = await prisma.$transaction(async (tx) => {

      const accessToken = jwt.sign(
        {userId: user.id, email: user.email, role:user.role},
        env.JWT_ACCESS_SECRET,
        {expiresIn: env.JWT_ACCESS_EXPIRY} as jwt.SignOptions
      )

      const refreshToken = jwt.sign(
        {userId: user.id},
        env.JWT_REFRESH_SECRET,
        {expiresIn: env.JWT_REFRESH_EXPIRY} as jwt.SignOptions
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt
      }
    })

    return { accessToken, refreshToken }
    }
  )

  const { password: _, ...userWithoutPassword } = user

  res.status(200).json({
    success: true,
    message: "Login successfully",
    data: {
      user: userWithoutPassword,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  })

  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      logger.error('Prisma validation error during login', { error })
      return next(ApiError.badRequest('Invalid input data'))
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('JWT error during login', { error })
      return next(ApiError.internal('Token generation failed'))
    }

    logger.error('Unexpected error during login', { error })
    next(error)
  }


}