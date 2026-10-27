import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDbStatus } from './server/config/db.ts';
import { initDatabaseStore } from './server/services/dbStore.ts';
import authRoutes from './server/routes/authRoutes.ts';
import complaintRoutes from './server/routes/complaintRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic security and request parsing
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Database connection and seed data
  await connectDB();
  await initDatabaseStore();

  // Health and DB status endpoint
  app.get('/api/health', (_req, res) => {
    const dbStatus = getDbStatus();
    res.json({
      status: 'healthy',
      service: 'ResolveDesk Complaint Management API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes);

  // Centralized Error Handling for API routes
  app.use('/api', errorHandler);

  // Frontend Serving / Vite integration
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global uncaught error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ResolveDesk server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 API Endpoints available at /api/*`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
