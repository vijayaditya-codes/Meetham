import dotenv from 'dotenv';
// Load environment variables before importing app
dotenv.config();

import app from './app';
import { prisma } from './config/db';
import { startExpireListingsJob } from './jobs/expire-listings.cron';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Meetham server started on port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
  console.log(`=========================================`);
  
  // Start Background Job Scheduler
  startExpireListingsJob();
});

// Graceful shutdown hooks
const shutdown = async (signal: string) => {
  console.log(`\n[${signal}] Shutting down server gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connections disconnected.');
    process.exit(0);
  });
  
  // Timeout shutdown after 10s
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
