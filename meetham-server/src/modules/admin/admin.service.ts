import { prisma } from '../../config/db';
import { RestaurantStatus } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';
import { toDecimal, toNumber } from '../../utils/decimal-helpers';

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Calculate GMV (Gross Merchandise Value) of paid or completed orders
  const completedOrders = await prisma.order.findMany({
    where: {
      OR: [
        { paymentStatus: 'PAID' },
        { status: 'COMPLETED' },
      ],
    },
    select: { totalAmount: true, items: { select: { quantity: true } } },
  });

  const gmv = completedOrders.reduce((sum, o) => sum + toNumber(o.totalAmount), 0);

  // 2. Count active listings
  const activeListings = await prisma.listing.count({
    where: {
      status: 'ACTIVE',
      expiresAt: { gt: now },
      quantityLeft: { gt: 0 },
    },
  });

  // 3. Count orders placed today
  const ordersToday = await prisma.order.count({
    where: {
      createdAt: { gte: startOfToday },
    },
  });

  // 4. Calculate food saved estimate (approx. 0.5kg of surplus food per ordered item)
  const totalItemsSold = completedOrders.reduce((sum, o) => {
    const orderQty = o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    return sum + orderQty;
  }, 0);

  const foodSavedKg = totalItemsSold * 0.5;

  return {
    gmv,
    activeListings,
    ordersToday,
    foodSavedKg,
  };
}

export async function getPendingRestaurants() {
  return prisma.restaurant.findMany({
    where: { status: RestaurantStatus.PENDING },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
    },
  });
}

export async function approveRestaurant(id: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant not found.');
  }

  return prisma.restaurant.update({
    where: { id },
    data: { status: RestaurantStatus.APPROVED },
  });
}

export async function suspendRestaurant(id: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant not found.');
  }

  return prisma.restaurant.update({
    where: { id },
    data: { status: RestaurantStatus.SUSPENDED },
  });
}

export async function getPayouts() {
  return prisma.payout.findMany({
    include: {
      restaurant: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function processPayout(
  restaurantId: string,
  amount: number,
  periodStart: string,
  periodEnd: string
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant not found.');
  }

  return prisma.payout.create({
    data: {
      restaurantId,
      amount: toDecimal(amount),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      status: 'PROCESSED',
      processedAt: new Date(),
    },
  });
}
