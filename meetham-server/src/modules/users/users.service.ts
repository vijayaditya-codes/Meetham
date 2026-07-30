import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      restaurant: true,
    },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true, isVerified: true },
  });
}

export async function getAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
}

export async function createAddress(userId: string, data: {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.create({ data: { userId, ...data } });
}

export async function updateAddress(userId: string, id: string, data: Partial<{
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}>) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new NotFoundError('Address not found');
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.update({ where: { id }, data });
}

export async function deleteAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new NotFoundError('Address not found');
  await prisma.address.delete({ where: { id } });
}
