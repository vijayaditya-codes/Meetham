import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const firebaseCallbackSchema = z.object({
  idToken: z.string().min(1, 'Firebase idToken is required'),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
});
