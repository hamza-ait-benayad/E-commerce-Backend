import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { validationResult } from "express-validator";
import { create, getAll, getById, deleteById, getBySlug } from "../services/productService";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   throw ApiError.badRequest(errors.array()[0].msg);
    // }
    const result = await create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result,
    });
  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAll();
    return res.status(200).json({
      success: true,
      message: 'All products fetched successfully',
      data: result,
    });
  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await getById(id);

    if (!result) {
      throw ApiError.notFound('Product not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: result,
    });
  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction ) => {
  try {
    const { slug } = req.params

    const result = await getBySlug(slug);

    if(!result) {
      throw ApiError.notFound("Product not found");
    }

    res.status(200).json(
      {
        success: true,
        message: "Product fetched successfully",
        data: result
      }
    )

  } catch(e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message))
  }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: result,
    });
  } catch (e: any) {
    next(e instanceof ApiError ? e : ApiError.internal(e.message));
  }
};