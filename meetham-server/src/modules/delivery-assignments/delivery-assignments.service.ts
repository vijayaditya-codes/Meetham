import { prisma } from '../../config/db';
import { DeliveryStatus, PartnerAvailability, OrderStatus, PaymentStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { broadcastOrderStatus } from '../../sockets/order.namespace';
import { createNotification } from '../notifications/notifications.service';

export async function acceptAssignment(assignmentId: string, userId: string) {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!partner) {
    throw new NotFoundError('Delivery partner profile not found.');
  }

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: assignmentId },
    include: { order: true },
  });

  if (!assignment) {
    throw new NotFoundError('Delivery assignment not found.');
  }

  if (assignment.partnerId !== partner.id) {
    throw new ForbiddenError('This assignment is not offered to you.');
  }

  if (assignment.status !== DeliveryStatus.ASSIGNED) {
    throw new BadRequestError(`Cannot accept assignment in state: ${assignment.status}`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Update partner availability to ON_DELIVERY
    await tx.deliveryPartner.update({
      where: { id: partner.id },
      data: { availability: PartnerAvailability.ON_DELIVERY },
    });

    // 2. Broadcast order tracking update
    broadcastOrderStatus(assignment.orderId, 'RIDER_ASSIGNED');

    // 3. Create customer notification
    await createNotification(
      assignment.order.customerId,
      'Rider Assigned',
      `Rider ${partner.user?.name || 'Partner'} has been assigned to deliver your order.`,
      'ORDER_UPDATE'
    );

    return assignment;
  });
}

const ALLOWED_DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.UNASSIGNED]: [DeliveryStatus.ASSIGNED],
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ARRIVED_AT_RESTAURANT, DeliveryStatus.FAILED],
  [DeliveryStatus.ARRIVED_AT_RESTAURANT]: [DeliveryStatus.PICKED_UP, DeliveryStatus.FAILED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.EN_ROUTE, DeliveryStatus.FAILED],
  [DeliveryStatus.EN_ROUTE]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.FAILED]: [],
};

export async function updateAssignmentStatus(
  assignmentId: string,
  userId: string,
  newStatus: DeliveryStatus,
  otpForDropoff?: string
) {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw new NotFoundError('Delivery partner profile not found.');
  }

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: assignmentId },
    include: { order: true },
  });

  if (!assignment) {
    throw new NotFoundError('Delivery assignment not found.');
  }

  if (assignment.partnerId !== partner.id) {
    throw new ForbiddenError('You are not authorized to edit this assignment.');
  }

  const currentStatus = assignment.status;
  const allowed = ALLOWED_DELIVERY_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition delivery status from ${currentStatus} to ${newStatus}.`
    );
  }

  // If status is DELIVERED, verify OTP code
  if (newStatus === DeliveryStatus.DELIVERED) {
    if (!otpForDropoff) {
      throw new BadRequestError('Dropoff OTP is required to mark delivery as completed.');
    }
    if (assignment.otpForDropoff !== otpForDropoff) {
      throw new BadRequestError('INVALID_OTP'); // Return clear error for verification
    }
  }

  return prisma.$transaction(async (tx) => {
    const updateData: any = { status: newStatus };
    if (newStatus === DeliveryStatus.PICKED_UP) {
      updateData.pickedUpAt = new Date();
    } else if (newStatus === DeliveryStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    // 1. Update assignment
    const updatedAssignment = await tx.deliveryAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // 2. Adjust order status accordingly
    let orderStatusUpdate = assignment.order.status;
    let paymentStatusUpdate = assignment.order.paymentStatus;

    if (newStatus === DeliveryStatus.DELIVERED) {
      orderStatusUpdate = OrderStatus.COMPLETED;
      paymentStatusUpdate = PaymentStatus.PAID;
      
      // Reset partner to ONLINE and increment delivery count
      await tx.deliveryPartner.update({
        where: { id: partner.id },
        data: {
          availability: PartnerAvailability.ONLINE,
          totalDeliveries: { increment: 1 },
        },
      });
    } else if (newStatus === DeliveryStatus.FAILED) {
      orderStatusUpdate = OrderStatus.CANCELLED;
      
      // Reset partner back to ONLINE
      await tx.deliveryPartner.update({
        where: { id: partner.id },
        data: { availability: PartnerAvailability.ONLINE },
      });
    }

    await tx.order.update({
      where: { id: assignment.orderId },
      data: {
        status: orderStatusUpdate,
        paymentStatus: paymentStatusUpdate,
      },
    });

    // 3. Broadcast real-time Socket.io updates to order room
    broadcastOrderStatus(assignment.orderId, `DELIVERY_${newStatus}`);

    // 4. Create customer notification alert
    let title = 'Delivery Status Update';
    let body = `Your order delivery status is now: ${newStatus.replace('_', ' ').toLowerCase()}`;

    if (newStatus === DeliveryStatus.ARRIVED_AT_RESTAURANT) {
      title = 'Rider Arrived';
      body = 'Rider has arrived at the restaurant to collect your food.';
    } else if (newStatus === DeliveryStatus.PICKED_UP) {
      title = 'Order Picked Up';
      body = 'Rider has picked up your fresh food and is starting navigation.';
    } else if (newStatus === DeliveryStatus.DELIVERED) {
      title = 'Order Delivered';
      body = 'Your surplus food order has been successfully delivered. Enjoy!';
    }

    await createNotification(
      assignment.order.customerId,
      title,
      body,
      'ORDER_UPDATE'
    );

    return updatedAssignment;
  });
}
