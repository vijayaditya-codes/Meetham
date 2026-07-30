import { prisma } from '../../config/db';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { toDecimal, toNumber } from '../../utils/decimal-helpers';

export async function validateCoupon(code: string, orderTotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    throw new BadRequestError('INVALID_CODE');
  }

  const now = new Date();
  if (coupon.validFrom > now || coupon.validTo < now) {
    throw new BadRequestError('EXPIRED');
  }

  if (coupon.minOrderValue && orderTotal < toNumber(coupon.minOrderValue)) {
    throw new BadRequestError('MIN_ORDER_NOT_MET');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new BadRequestError('USAGE_LIMIT_REACHED');
  }

  // Calculate discount amount
  let discountAmount = 0;
  const val = toNumber(coupon.discountValue);

  if (coupon.discountType === 'PERCENT') {
    discountAmount = orderTotal * (val / 100);
    if (coupon.maxDiscount && discountAmount > toNumber(coupon.maxDiscount)) {
      discountAmount = toNumber(coupon.maxDiscount);
    }
  } else if (coupon.discountType === 'FLAT') {
    discountAmount = val;
  }

  // Discount cannot exceed the order total
  if (discountAmount > orderTotal) {
    discountAmount = orderTotal;
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountAmount,
    discountType: coupon.discountType,
    discountValue: val,
  };
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
}) {
  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: toDecimal(data.discountValue),
      minOrderValue: data.minOrderValue ? toDecimal(data.minOrderValue) : null,
      maxDiscount: data.maxDiscount ? toDecimal(data.maxDiscount) : null,
      usageLimit: data.usageLimit,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
    },
  });
}

export async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { validTo: 'asc' },
  });
}
