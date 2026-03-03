import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

export const cartSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {

  let sessionId = req.cookies.cart_session as string | undefined;;

  if (!req.user && !sessionId) {
    sessionId = uuid();

    res.cookie("cart_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  }

  req.sessionId = sessionId;
  next()
}