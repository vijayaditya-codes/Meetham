import { prisma } from '../../config/db';
import { PartnerAvailability, Role } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export async function apply(userId: string, data: {
  vehicleType: string;
  licensePlate?: string;
}) {
  const existing = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new BadRequestError('User is already registered as a delivery partner.');
  }

  return prisma.$transaction(async (tx) => {
    const partner = await tx.deliveryPartner.create({
      data: {
        userId,
        vehicleType: data.vehicleType,
        licensePlate: data.licensePlate || null,
        availability: PartnerAvailability.OFFLINE,
        isVerified: true, // Auto-verify for development ease
      },
    });

    // Update user role
    await tx.user.update({
      where: { id: userId },
      data: { role: Role.DELIVERY_PARTNER },
    });

    return partner;
  });
}

export async function updateAvailability(userId: string, availability: PartnerAvailability) {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw new NotFoundError('Delivery partner profile not found.');
  }

  return prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { availability },
  });
}

export async function updateLocation(userId: string, lat: number, lng: number) {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw new NotFoundError('Delivery partner profile not found.');
  }

  return prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: {
      currentLat: lat,
      currentLng: lng,
      lastPingAt: new Date(),
    },
  });
}

export async function getAssignments(userId: string) {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw new NotFoundError('Delivery partner profile not found.');
  }

  return prisma.deliveryAssignment.findMany({
    where: { partnerId: partner.id },
    include: {
      order: {
        include: {
          restaurant: {
            select: { id: true, name: true, address: true, latitude: true, longitude: true },
          },
          deliveryAddress: {
            select: { id: true, label: true, line1: true, line2: true, city: true, latitude: true, longitude: true },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });
}
