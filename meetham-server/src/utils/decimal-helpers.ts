import { Prisma } from '@prisma/client';

export function toDecimal(value: number | string | Prisma.Decimal): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) return value;
  return new Prisma.Decimal(value);
}

export function toNumber(value: Prisma.Decimal | number | string): number {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  return Number(value);
}
