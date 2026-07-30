import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['UPI', 'CARD', 'COD']).default('UPI'),
  pickupWindowFrom: z.string().optional(),
  pickupWindowTo: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const verifyPickupSchema = z.object({
  pickupCode: z.string().min(1, 'Pickup code is required'),
});
