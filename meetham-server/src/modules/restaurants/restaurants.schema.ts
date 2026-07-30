import { z } from 'zod';
import { RestaurantStatus } from '@prisma/client';

export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  description: z.string().optional(),
  cuisineTags: z.array(z.string()).default([]),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  city: z.string().min(2, 'City is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gstNumber: z.string().optional().or(z.literal('')),
  fssaiLicense: z.string().optional().or(z.literal('')),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const updateRestaurantStatusSchema = z.object({
  status: z.nativeEnum(RestaurantStatus),
});
