// validators/cart.validator.ts
import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
