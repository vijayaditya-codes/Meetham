import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { OrderStatus } from '@prisma/client';

export async function createReview(
  userId: string,
  data: {
    orderId: string;
    rating: number;
    comment?: string;
  }
) {
  // Find order
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Verify order belongs to customer
  if (order.customerId !== userId) {
    throw new BadRequestError('You can only review your own orders.');
  }

  // Verify order is COMPLETED
  if (order.status !== OrderStatus.COMPLETED) {
    throw new BadRequestError('You can only review completed orders.');
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { orderId: data.orderId },
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this order.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create review
    const review = await tx.review.create({
      data: {
        orderId: data.orderId,
        customerId: userId,
        restaurantId: order.restaurantId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    // 2. Fetch all reviews for this restaurant to compute new average
    const allReviews = await tx.review.findMany({
      where: { restaurantId: order.restaurantId },
      select: { rating: true },
    });

    const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRatings / allReviews.length;

    // 3. Update restaurant average rating
    await tx.restaurant.update({
      where: { id: order.restaurantId },
      data: { avgRating },
    });

    return review;
  });
}
