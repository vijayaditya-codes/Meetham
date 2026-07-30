import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
