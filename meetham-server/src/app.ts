import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRouter from './modules/auth/auth.routes';
import restaurantsRouter from './modules/restaurants/restaurants.routes';
import listingsRouter from './modules/listings/listings.routes';
import cartRouter from './modules/cart/cart.routes';
import ordersRouter from './modules/orders/orders.routes';
import paymentsRouter from './modules/payments/payments.routes';
import reviewsRouter from './modules/reviews/reviews.routes';
import adminRouter from './modules/admin/admin.routes';
import uploadsRouter from './modules/uploads/uploads.routes';
import usersRouter from './modules/users/users.routes';

import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './utils/errors';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Base health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Modular routes mapping
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/restaurants', restaurantsRouter);
app.use('/api/v1/listings', listingsRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/uploads', uploadsRouter);

// Catch 404
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found.`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
