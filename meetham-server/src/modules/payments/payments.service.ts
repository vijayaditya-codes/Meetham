import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { toNumber } from '../../utils/decimal-helpers';

export async function createPaymentIntent(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  if (order.customerId !== userId) {
    throw new BadRequestError('Unauthorized payment attempt.');
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    throw new BadRequestError('This order is already paid.');
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123';

  // Return payment details, simulating a Razorpay order response
  return {
    razorpayOrderId: `rzp_order_${order.id}`,
    amount: Math.round(toNumber(order.totalAmount) * 100), // amount in paise
    currency: 'INR',
    keyId: razorpayKeyId,
    orderId: order.id,
  };
}

export async function verifyWebhook(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const orderId = payload.razorpay_order_id.replace('rzp_order_', '');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Associated order not found.');
  }

  // Update order status to CONFIRMED and payment to PAID
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.CONFIRMED,
      paymentMethod: 'CARD', // Update to CARD since payment went through online gateway
    },
  });

  return updatedOrder;
}
