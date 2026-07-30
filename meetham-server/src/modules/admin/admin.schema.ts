import { z } from 'zod';

export const processPayoutSchema = z.object({
  amount: z.number().positive('Payout amount must be positive'),
  periodStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  periodEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
});
