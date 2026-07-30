import { PrismaClient, Role, ListingStatus, OrderStatus, PaymentStatus, RestaurantStatus, PartnerAvailability } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MUMBAI_LOCATIONS = [
  { name: 'Spice Route Kitchen', lat: 19.076, lng: 72.8777, cuisine: ['North Indian', 'Mughlai'] },
  { name: 'Bombay Bakehouse', lat: 19.0825, lng: 72.8417, cuisine: ['Bakery', 'Continental'] },
  { name: 'Coastal Curry Co.', lat: 19.0596, lng: 72.8295, cuisine: ['South Indian', 'Seafood'] },
];

const LISTING_CATEGORIES = ['Bakery', 'Meals', 'Grocery'];

async function main() {
  await prisma.$transaction(async (tx) => {
    // Clear existing data (dev seed only)
    await tx.notification.deleteMany();
    await tx.deliveryAssignment.deleteMany();
    await tx.deliveryPartner.deleteMany();
    await tx.coupon.deleteMany();
    await tx.review.deleteMany();
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.cartItem.deleteMany();
    await tx.listing.deleteMany();
    await tx.payout.deleteMany();
    await tx.restaurant.deleteMany();
    await tx.address.deleteMany();
    await tx.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 12);

    // Admin user
    const admin = await tx.user.create({
      data: {
        email: 'admin@meetham.in',
        name: 'Meetham Admin',
        role: Role.ADMIN,
        passwordHash,
        isVerified: true,
      },
    });

    const restaurants = [];
    const owners = [];

    for (const loc of MUMBAI_LOCATIONS) {
      const owner = await tx.user.create({
        data: {
          email: faker.internet.email({ provider: 'restaurant.meetham.in' }).toLowerCase(),
          name: faker.person.fullName(),
          role: Role.RESTAURANT,
          passwordHash,
          phone: faker.string.numeric(10),
          isVerified: true,
        },
      });
      owners.push(owner);

      const restaurant = await tx.restaurant.create({
        data: {
          ownerId: owner.id,
          name: loc.name,
          description: faker.company.catchPhrase(),
          cuisineTags: loc.cuisine,
          status: RestaurantStatus.APPROVED,
          gstNumber: `27${faker.string.alphanumeric(13).toUpperCase()}`,
          fssaiLicense: faker.string.numeric(14),
          address: faker.location.streetAddress(),
          city: 'Mumbai',
          latitude: loc.lat,
          longitude: loc.lng,
          avgRating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
          isOpen: true,
        },
      });
      restaurants.push(restaurant);
    }

    const allListings = [];

    for (const restaurant of restaurants) {
      for (let i = 0; i < 5; i++) {
        const originalPrice = faker.number.float({ min: 200, max: 800, fractionDigits: 2 });
        const discount = faker.number.float({ min: 0.4, max: 0.7, fractionDigits: 2 });
        const discountedPrice = Math.round(originalPrice * (1 - discount) * 100) / 100;
        const quantity = faker.number.int({ min: 3, max: 15 });

        const hoursUntilExpiry = faker.number.int({ min: 1, max: 48 });

        const listing = await tx.listing.create({
          data: {
            restaurantId: restaurant.id,
            title: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            category: faker.helpers.arrayElement(LISTING_CATEGORIES),
            originalPrice,
            discountedPrice,
            quantityTotal: quantity,
            quantityLeft: quantity,
            expiresAt: new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000),
            status: ListingStatus.ACTIVE,
          },
        });
        allListings.push(listing);
      }
    }

    // Sample customer
    const customer = await tx.user.create({
      data: {
        email: 'customer@meetham.in',
        name: faker.person.fullName(),
        role: Role.CUSTOMER,
        passwordHash,
        phone: faker.string.numeric(10),
        isVerified: true,
      },
    });

    // 2 completed orders with reviews
    for (let i = 0; i < 2; i++) {
      const restaurant = restaurants[i];
      const listing = allListings[i * 5];
      const qty = 2;
      const subtotal = Number(listing.discountedPrice) * qty;
      const platformFee = subtotal * (restaurant.commissionRate / 100);
      const totalAmount = subtotal + platformFee;

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          restaurantId: restaurant.id,
          status: OrderStatus.COMPLETED,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: 'UPI',
          subtotal,
          platformFee,
          totalAmount,
          pickupCode: faker.string.numeric(6),
          pickupWindowFrom: new Date(Date.now() - 48 * 60 * 60 * 1000),
          pickupWindowTo: new Date(Date.now() - 24 * 60 * 60 * 1000),
          items: {
            create: {
              listingId: listing.id,
              quantity: qty,
              priceAtOrder: listing.discountedPrice,
            },
          },
        },
      });

      await tx.review.create({
        data: {
          orderId: order.id,
          customerId: customer.id,
          restaurantId: restaurant.id,
          rating: faker.number.int({ min: 4, max: 5 }),
          comment: faker.lorem.sentence(),
        },
      });

      // Update restaurant avg rating
      const reviews = await tx.review.findMany({ where: { restaurantId: restaurant.id } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await tx.restaurant.update({
        where: { id: restaurant.id },
        data: { avgRating },
      });
    }

    // ─────────────────────────────────────────────
    // NEW SEEDS FOR DELIVERY
    // ─────────────────────────────────────────────

    // Seed 2 delivery partners
    const rider1User = await tx.user.create({
      data: {
        email: 'rider1@meetham.in',
        name: 'Ramesh Kumar',
        role: Role.DELIVERY_PARTIER || Role.DELIVERY_PARTNER, // Fallback check
        passwordHash,
        phone: '9800000001',
        isVerified: true,
      },
    });

    await tx.deliveryPartner.create({
      data: {
        userId: rider1User.id,
        vehicleType: 'BIKE',
        licensePlate: 'MH-01-AB-1234',
        availability: PartnerAvailability.ONLINE,
        currentLat: 19.0760, // near Spice Route Kitchen
        currentLng: 72.8777,
        isVerified: true,
      },
    });

    const rider2User = await tx.user.create({
      data: {
        email: 'rider2@meetham.in',
        name: 'Suresh Patil',
        role: Role.DELIVERY_PARTIER || Role.DELIVERY_PARTNER,
        passwordHash,
        phone: '9800000002',
        isVerified: true,
      },
    });

    await tx.deliveryPartner.create({
      data: {
        userId: rider2User.id,
        vehicleType: 'SCOOTER',
        licensePlate: 'MH-02-CD-5678',
        availability: PartnerAvailability.ONLINE,
        currentLat: 19.0825, // near Bombay Bakehouse
        currentLng: 72.8417,
        isVerified: true,
      },
    });

    // Seed coupons
    await tx.coupon.createMany({
      data: [
        {
          code: 'SAVE20',
          description: 'Save 20% on your first order',
          discountType: 'PERCENT',
          discountValue: 20.0,
          minOrderValue: 100.0,
          maxDiscount: 50.0,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          code: 'FLAT50',
          description: 'Flat ₹50 off on orders above ₹150',
          discountType: 'FLAT',
          discountValue: 50.0,
          minOrderValue: 150.0,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ],
    });

    console.log('Seed complete:');
    console.log(`  Admin: ${admin.email} / password123`);
    console.log(`  Customer: ${customer.email} / password123`);
    console.log(`  Riders: rider1@meetham.in / password123, rider2@meetham.in / password123`);
    console.log(`  Restaurants: ${restaurants.length}`);
    console.log(`  Listings: ${allListings.length}`);
    console.log(`  Completed orders: 2`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
