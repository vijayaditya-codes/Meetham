import { z } from 'zod';
import { ListingStatus } from '@prisma/client';

export const createListingSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  originalPrice: z.number().positive('Original price must be positive'),
  discountedPrice: z.number().positive('Discounted price must be positive'),
  quantityTotal: z.number().int().positive('Quantity total must be at least 1'),
  expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiration date format',
  }),
});

export const updateListingSchema = createListingSchema.partial().extend({
  quantityLeft: z.number().int().nonnegative().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
});

export const queryListingsSchema = z.object({
  lat: z.string().transform(Number).optional(),
  lng: z.string().transform(Number).optional(),
  radius: z.string().transform(Number).default(10), // default 10km radius
  category: z.string().optional(),
  search: z.string().optional(),
});
