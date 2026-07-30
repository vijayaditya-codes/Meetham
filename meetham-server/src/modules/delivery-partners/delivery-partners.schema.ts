import { z } from 'zod';
import { PartnerAvailability } from '@prisma/client';

export const applyPartnerSchema = z.object({
  vehicleType: z.enum(['BIKE', 'BICYCLE', 'SCOOTER']),
  licensePlate: z.string().optional().or(z.literal('')),
});

export const updateAvailabilitySchema = z.object({
  availability: z.nativeEnum(PartnerAvailability),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
