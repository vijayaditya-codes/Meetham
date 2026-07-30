import { prisma } from '../../config/db';
import { DeliveryStatus, PartnerAvailability } from '@prisma/client';
import { getHaversineDistance } from '../../utils/geo-distance';
import { generateOTP } from '../../utils/otp-generator';
import { sendRiderAssignmentOffer } from '../../sockets/rider.namespace';
import { createNotification } from '../notifications/notifications.service';

export async function triggerRiderAssignment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order || order.fulfillmentType !== 'DELIVERY') return;

    // 1. Query online riders
    const onlinePartners = await prisma.deliveryPartner.findMany({
      where: { availability: PartnerAvailability.ONLINE, isVerified: true },
      include: { user: true },
    });

    if (onlinePartners.length === 0) {
      console.log(`[Assignment Engine] No online riders available for order ${orderId}. Marked as UNASSIGNED.`);
      // Create notification for admin or restaurant
      await createNotification(
        order.restaurant.ownerId,
        'No Riders Online',
        'Your delivery order is ready to be assigned, but no riders are currently online.',
        'SYSTEM'
      );
      return;
    }

    // 2. Sort riders by distance to restaurant using Haversine
    const restaurantLat = order.restaurant.latitude;
    const restaurantLng = order.restaurant.longitude;

    const ridersWithDistance = onlinePartners
      .map((partner) => {
        const lat = partner.currentLat ?? restaurantLat;
        const lng = partner.currentLng ?? restaurantLng;
        const distance = getHaversineDistance(restaurantLat, restaurantLng, lat, lng);
        return { partner, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    // 3. Assign to the first candidate
    await assignRiderRecursive(orderId, ridersWithDistance, 0);
  } catch (error) {
    console.error('[Assignment Engine Error]:', error);
  }
}

async function assignRiderRecursive(
  orderId: string,
  candidates: Array<{ partner: any; distance: number }>,
  index: number
) {
  if (index >= candidates.length) {
    console.log(`[Assignment Engine] All online riders rejected or ignored order ${orderId}.`);
    return;
  }

  const candidate = candidates[index].partner;
  const otpForDropoff = generateOTP();

  try {
    // Upsert or create assignment
    const assignment = await prisma.deliveryAssignment.upsert({
      where: { orderId },
      create: {
        orderId,
        partnerId: candidate.id,
        status: DeliveryStatus.ASSIGNED,
        otpForDropoff,
        distanceKm: candidates[index].distance,
        estimatedMinutes: Math.round(15 + candidates[index].distance * 4), // 15 mins base + 4 mins per km
      },
      update: {
        partnerId: candidate.id,
        status: DeliveryStatus.ASSIGNED,
        otpForDropoff,
        distanceKm: candidates[index].distance,
        estimatedMinutes: Math.round(15 + candidates[index].distance * 4),
        assignedAt: new Date(),
        pickedUpAt: null,
        deliveredAt: null,
      },
      include: {
        order: {
          include: {
            restaurant: { select: { name: true, address: true } },
          },
        },
      },
    });

    // Notify rider via socket offer
    const socketDetails = {
      assignmentId: assignment.id,
      orderId: assignment.orderId,
      restaurantName: assignment.order.restaurant.name,
      restaurantAddress: assignment.order.restaurant.address,
      estimatedMinutes: assignment.estimatedMinutes,
      distanceKm: assignment.distanceKm,
    };

    const isDeliveredViaSocket = sendRiderAssignmentOffer(candidate.userId, socketDetails);

    if (!isDeliveredViaSocket) {
      // If rider socket is dead, fall through immediately
      console.log(`[Assignment Engine] Rider ${candidate.user.name} is offline. Skipping...`);
      await assignRiderRecursive(orderId, candidates, index + 1);
      return;
    }

    // Set 30-second accept timeout
    setTimeout(async () => {
      try {
        const currentAssignment = await prisma.deliveryAssignment.findUnique({
          where: { id: assignment.id },
        });

        // If rider has not accepted, reassign to next nearest
        if (currentAssignment && currentAssignment.status === DeliveryStatus.ASSIGNED) {
          console.log(`[Assignment Engine] Rider ${candidate.user.name} ignored offer for order ${orderId}. Re-assigning...`);
          
          await prisma.deliveryAssignment.update({
            where: { id: assignment.id },
            data: { status: DeliveryStatus.UNASSIGNED },
          });

          await assignRiderRecursive(orderId, candidates, index + 1);
        }
      } catch (timeoutError) {
        console.error('[Assignment Timeout Error]:', timeoutError);
      }
    }, 30000);
  } catch (error) {
    console.error(`[Assignment Engine] Failed to assign order ${orderId} to index ${index}:`, error);
  }
}
