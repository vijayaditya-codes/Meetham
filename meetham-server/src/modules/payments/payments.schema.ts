import { z } from 'zod';

export const createIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const webhookSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
