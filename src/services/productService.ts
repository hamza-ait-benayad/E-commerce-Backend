import { CreateProductDTO } from '../types/product.types';
import prisma from '../utils/prisma';
import { Product } from '@prisma/client';



export const getAllProducts = async (): Promise<Product[]> => {
  return await prisma.product.findMany();
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true, variants: true },
  });

  return product
}

export const createProduct = async (data: CreateProductDTO) => {

  const { images, ...rest } = data

  return await prisma.product.create({
    data: {
      ...rest,
      images: images ? { create: images.map((url) => ({ url })) } : undefined,
    }
  })
}


export const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
}





