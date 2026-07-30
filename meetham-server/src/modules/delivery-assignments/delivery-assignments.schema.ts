import { z } from 'zod';
import { DeliveryStatus } from '@prisma/client';

export const updateAssignmentStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
  otpForDropoff: z.string().optional(),
});
