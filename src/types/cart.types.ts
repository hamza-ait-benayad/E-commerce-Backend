import { Decimal } from "@prisma/client/runtime/library";

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: Decimal;
  product: {
    id: string;
    name: string;
    slug: string;
    price: Decimal;
    images: Array<{
      url: string;
      alt: string | null;
      isPrimary: boolean;
    }>;
    inventory: {
      quantity: number;
      reserved: number;
    } | null;
  };
  subtotal: Decimal;
}

export interface CartResponse {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummaryResponse {
  itemCount: number;
  subtotal: Decimal;
}
