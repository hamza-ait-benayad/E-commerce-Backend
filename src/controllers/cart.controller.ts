import { Request, Response, NextFunction } from "express"
import { addItemToCartService, getCartService } from "../services/cartService"
import { ApiError } from "../utils/apiError";
import { addToCartSchema } from "../validators/cart.validator";


export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {

    const userId = req.user?.userId;
    const sessionId = req.sessionId;

    if (!userId && !sessionId) {
      throw ApiError.badRequest('Either userId or sessionId is required')
    }

    const cart = await getCartService(userId, sessionId);

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart
    })
  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.user?.userId;
    const sessionId = req.sessionId;

    if (!userId && !sessionId) {
      throw ApiError.badRequest("Either userId or sessionId is required");
    }

    const {productId, quantity} = addToCartSchema.parse(req.body);

    const cart = await addItemToCartService(userId, sessionId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Item added to cart seccessfully",
      data: cart
    });

  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};

