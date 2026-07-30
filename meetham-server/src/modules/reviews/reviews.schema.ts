import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});
