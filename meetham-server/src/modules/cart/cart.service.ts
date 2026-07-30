import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ListingStatus } from '@prisma/client';

export async function getCart(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              isOpen: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addItem(userId: string, listingId: string, quantity: number) {
  // Check if listing exists and is active
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { restaurant: true },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  if (listing.status !== ListingStatus.ACTIVE || listing.expiresAt <= new Date()) {
    throw new BadRequestError('This listing has expired or is no longer active.');
  }

  if (listing.quantityLeft < quantity) {
    throw new BadRequestError(`Only ${listing.quantityLeft} items left in stock.`);
  }

  // Enforce single-restaurant rule in cart
  const currentCartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { listing: true },
  });

  if (currentCartItems.length > 0) {
    const existingRestaurantId = currentCartItems[0].listing.restaurantId;
    if (existingRestaurantId !== listing.restaurantId) {
      throw new BadRequestError(
        'Your cart already contains items from another restaurant. Please clear your cart first.'
      );
    }
  }

  // Add or increment item
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_listingId: { userId, listingId },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (listing.quantityLeft < newQuantity) {
      throw new BadRequestError(`Cannot add more. Only ${listing.quantityLeft} items left in stock.`);
    }
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      listingId,
      quantity,
    },
  });
}

export async function updateItem(userId: string, listingId: string, quantity: number) {
  if (quantity === 0) {
    return removeItem(userId, listingId);
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  if (listing.quantityLeft < quantity) {
    throw new BadRequestError(`Only ${listing.quantityLeft} items left in stock.`);
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_listingId: { userId, listingId },
    },
  });

  if (!existingItem) {
    throw new NotFoundError('Cart item not found.');
  }

  return prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity },
  });
}

export async function removeItem(userId: string, listingId: string) {
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_listingId: { userId, listingId },
    },
  });

  if (!existingItem) {
    throw new NotFoundError('Cart item not found.');
  }

  await prisma.cartItem.delete({
    where: { id: existingItem.id },
  });
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });
}
