import { z } from 'zod';

export const addToCartSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
});
