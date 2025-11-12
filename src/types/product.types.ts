import { Decimal } from "@prisma/client/runtime/library";

export interface CreateProductDTO {
  name: string;
  slug: string;
  description: string;
  price: Decimal | number;
  comparePrice?: Decimal | number;
  sku: string;
  categoryId: string;
  images?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
