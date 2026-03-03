import { Decimal } from '@prisma/client/runtime/library';
import { CartResponse } from '../types/cart.types';
import { ApiError } from '../utils/apiError';
import prisma from '../utils/prisma';

export const getCartService = async (
    userId?: string,
    sessionId?: string
): Promise<CartResponse> => {

    if (!userId && !sessionId) {
        throw ApiError.badRequest('Either userId or sessionId is required');
    }

    let cart: any = await prisma.cart.findUnique({
        where: userId ? { userId } : { sessionId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isPrimary: true },
                                take: 1,
                            },
                            inventory: true,
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: userId || null,
                sessionId: sessionId || null,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                                inventory: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return formatCartResponse(cart);
};

export const addItemToCartService = async (
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    quantity: number
): Promise<CartResponse> => {

    const product = await prisma.product.findFirst({
        where: { id: productId },
        include: { inventory: true },
    });

    if (!product) {
        throw ApiError.badRequest('Product not found');
    }

    if (!product.isActive) {
        throw ApiError.badRequest('Product is not available');
    }

    if (product.inventory) {
        const availableQuantity =
            product.inventory.quantity - product.inventory.reserved;

        if (availableQuantity < quantity) {
            throw ApiError.badRequest(
                `Only ${availableQuantity} items available in stock`
            );
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        let cart = await tx.cart.findFirst({
            where: userId ? { userId } : { sessionId },
        });

        if (!cart) {
            cart = await tx.cart.create({
                data: {
                    userId: userId || null,
                    sessionId: sessionId || null,
                },
            });
        }

        const existingItem = await tx.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId,
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (product.inventory) {
                const availableQuantity =
                    product.inventory.quantity - product.inventory.reserved;

                if (availableQuantity < newQuantity) {
                    throw ApiError.badRequest(
                        `Only ${availableQuantity} items in the stock`
                    );
                }
            }

            await tx.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            await tx.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price: product.price,
                },
            });
        }

        if (product.inventory) {
            await tx.inventory.update({
                where: { id: product.inventory.id },
                data: {
                    reserved: {
                        increment: quantity,
                    },
                },
            });
        }

        return await tx.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                                inventory: true,
                            },
                        },
                    },
                },
            },
        });
    });

    if (!result) {
        throw ApiError.internal("Failed to add item to cart");
    }

    return formatCartResponse(result);

};


export const removeItemFromCart = async (
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    ) => {
        if(!userId && !sessionId) {
            throw ApiError.badRequest("Either userId or sessionId is required")
        }

        const cart = await prisma.cart.findFirst ({
            where: userId ? {userId} : {sessionId}
        })

        if(!cart) {
            throw ApiError.badRequest("cart not found")
        }

        const item = await prisma.cartItem.findFirst({
            where: {cartId: cart?.id, productId},
            include: {product: {include: {inventory: true}}}
        })

        if(!item){
            throw ApiError.badRequest("Product doesn't exist in the cart")
        }

        await prisma.cartItem.delete({
            where: {id: item.id}
        })

        if(item.product.inventory) {
        await prisma.inventory.update({
            where:{id: item.product.inventory.id},
            data: {
                reserved : {
                    decrement: item.quantity
                }
            }
        })
    }

    const result = await prisma.cart.findUnique({
        where:{id: cart.id},
        include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                                inventory: true,
                            },
                        },
                    },
                },
            },
        }
    )
    
    return formatCartResponse(cart);
}

function formatCartResponse(cart: any): CartResponse {
    const items = cart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            images: item.product.images,
            inventory: item.product.inventory,
        },
        subtotal: new Decimal(item.price).mul(item.quantity),
    }));

    const itemCount = items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (sum: Decimal, item: any) => sum.add(item.subtotal),
        new Decimal(0)
    );

    return {
        id: cart.id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        items,
        itemCount,
        subtotal,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
    };
}
