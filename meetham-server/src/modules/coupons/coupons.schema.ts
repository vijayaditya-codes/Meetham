import { z } from 'zod';

export const validateCouponQuerySchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  orderTotal: z.string().transform(Number),
});

export const createCouponSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val))),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val))),
});
