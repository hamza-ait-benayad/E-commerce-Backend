import { CreateProductDTO } from '../types/product.types';
import prisma from '../utils/prisma';
import { Product } from '@prisma/client';

// Helper function to generate URL-friendly slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
}

// Helper function to generate unique SKU
const generateSKU = (name: string): string => {
  const prefix = name
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X'); // Use first 3 letters or X if not alphabetic

  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars

  return `${prefix}-${timestamp}-${random}`;
}

export const getAll = async (): Promise<Product[]> => {
  return await prisma.product.findMany();
}

export const getById = async (id: string): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true, variants: true },
  });

  return product
}

export const getBySlug = async (slug: string): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true, variants: true },
  })

  return product
}

export const create = async (data: CreateProductDTO) => {

  const { images, ...rest } = data

  // Generate slug from name if not provided
  const slug = rest.slug || generateSlug(rest.name);

  // Generate SKU from name if not provided
  const sku = rest.sku || generateSKU(rest.name);

  return await prisma.product.create({
    data: {
      ...rest,
      slug,
      sku,
      images: images ? { create: images.map((url) => ({ url })) } : undefined,
    }
  })
}


export const deleteById = async (id: string) => {
  return prisma.product.delete({ where: { id } });
}





