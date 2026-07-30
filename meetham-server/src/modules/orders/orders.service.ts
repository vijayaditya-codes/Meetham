import { prisma } from '../../config/db';
import { OrderStatus, PaymentStatus, Prisma, Role } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { decrementStockTransaction } from '../listings/listings.service';
import { generateOTP } from '../../utils/otp-generator';
import { toDecimal, toNumber } from '../../utils/decimal-helpers';

export async function checkout(
  userId: string,
  data: {
    paymentMethod: string;
    pickupWindowFrom?: string;
    pickupWindowTo?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    // 1. Get user's cart items
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestError('Your cart is empty.');
    }

    const restaurant = cartItems[0].listing.restaurant;
    const restaurantId = restaurant.id;
    const commissionRate = restaurant.commissionRate;

    // 2. Validate stock and decrement transactionally
    const orderItemsData = [];
    let subtotal = 0;
    let minExpiryTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h limit default

    for (const item of cartItems) {
      // Decrement listing stock
      await decrementStockTransaction(tx, item.listingId, item.quantity);

      const price = toNumber(item.listing.discountedPrice);
      subtotal += price * item.quantity;

      orderItemsData.push({
        listingId: item.listingId,
        quantity: item.quantity,
        priceAtOrder: item.listing.discountedPrice,
      });

      if (item.listing.expiresAt < minExpiryTime) {
        minExpiryTime = item.listing.expiresAt;
      }
    }

    // 3. Math calculations
    const platformFeeVal = subtotal * (commissionRate / 100);
    const totalAmountVal = subtotal + platformFeeVal;

    const subtotalDec = toDecimal(subtotal);
    const platformFeeDec = toDecimal(platformFeeVal);
    const totalAmountDec = toDecimal(totalAmountVal);

    // 4. Generate OTP pickup code
    const pickupCode = generateOTP();

    // 5. Setup pickup window
    const pickupWindowFrom = data.pickupWindowFrom ? new Date(data.pickupWindowFrom) : new Date();
    const pickupWindowTo = data.pickupWindowTo ? new Date(data.pickupWindowTo) : minExpiryTime;

    // 6. Create Order and Order Items
    const order = await tx.order.create({
      data: {
        customerId: userId,
        restaurantId,
        status: OrderStatus.PLACED,
        paymentStatus: data.paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        paymentMethod: data.paymentMethod,
        subtotal: subtotalDec,
        platformFee: platformFeeDec,
        totalAmount: totalAmountDec,
        pickupCode,
        pickupWindowFrom,
        pickupWindowTo,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
    });

    // 7. Clear cart
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return order;
  });
}

export async function getOrders(userId: string, role: Role) {
  if (role === Role.CUSTOMER) {
    return prisma.order.findMany({
      where: { customerId: userId },
      include: {
        restaurant: {
          select: { id: true, name: true, logoUrl: true, address: true },
        },
        items: {
          include: { listing: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (role === Role.RESTAURANT) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: userId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant profile not found for this user.');
    }

    return prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: { listing: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    // Admin gets everything
    return prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        restaurant: { select: { name: true } },
        items: { include: { listing: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export async function getOrderById(id: string, userId: string, role: Role) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      restaurant: { select: { id: true, name: true, ownerId: true, address: true } },
      items: { include: { listing: true } },
      review: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Validate authorization
  const isCustomer = order.customerId === userId;
  const isRestaurantOwner = order.restaurant.ownerId === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isCustomer && !isRestaurantOwner && !isAdmin) {
    throw new ForbiddenError('You are not authorized to view this order.');
  }

  return order;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export async function updateOrderStatus(id: string, userId: string, newStatus: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { restaurant: true, items: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Verification: Only owner of the restaurant can transition orders
  if (order.restaurant.ownerId !== userId) {
    throw new ForbiddenError('You do not have permission to manage this order.');
  }

  const currentStatus = order.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(`Cannot transition order status from ${currentStatus} to ${newStatus}.`);
  }

  // If transition to COMPLETED, check paymentStatus (must be PAID unless COD which is collected on delivery)
  let paymentStatusUpdate = order.paymentStatus;
  if (newStatus === OrderStatus.COMPLETED) {
    paymentStatusUpdate = PaymentStatus.PAID;
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      paymentStatus: paymentStatusUpdate,
    },
    include: {
      items: { include: { listing: true } },
    },
  });

  // If order cancelled, return the stock!
  if (newStatus === OrderStatus.CANCELLED) {
    await returnStock(order.items);
  }

  return updatedOrder;
}

export async function verifyPickupCode(id: string, userId: string, pickupCode: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { restaurant: true, items: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  if (order.restaurant.ownerId !== userId) {
    throw new ForbiddenError('You do not have permission to manage this order.');
  }

  if (order.status !== OrderStatus.READY_FOR_PICKUP && order.status !== OrderStatus.CONFIRMED) {
    throw new BadRequestError('Order is not ready for pickup.');
  }

  if (order.pickupCode !== pickupCode) {
    throw new BadRequestError('Invalid verification OTP code.');
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      items: { include: { listing: true } },
    },
  });

  return updatedOrder;
}

export async function cancelOrder(id: string, userId: string, role: Role) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { restaurant: true, items: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  const isCustomer = order.customerId === userId;
  const isRestaurantOwner = order.restaurant.ownerId === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isCustomer && !isRestaurantOwner && !isAdmin) {
    throw new ForbiddenError('You are not authorized to cancel this order.');
  }

  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
    throw new BadRequestError(`Cannot cancel order which is already ${order.status.toLowerCase()}.`);
  }

  // Customers can only cancel when order is still PLACED
  if (isCustomer && order.status !== OrderStatus.PLACED) {
    throw new BadRequestError('You can only cancel your order before it has been confirmed by the restaurant.');
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });

  // Return the stock
  await returnStock(order.items);

  return updatedOrder;
}

// Private helper to restore inventory stock on cancel
async function returnStock(items: any[]) {
  for (const item of items) {
    await prisma.listing.update({
      where: { id: item.listingId },
      data: {
        quantityLeft: {
          increment: item.quantity,
        },
        status: 'ACTIVE', // reactivate if it was sold out
      },
    });
  }
}
