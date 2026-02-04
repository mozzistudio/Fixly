import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'dotenv/config';

import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { rateLimiter } from './middleware/rate-limiter';
import { authRouter } from './routes/auth';
import { ticketsRouter } from './routes/tickets';
import { customersRouter } from './routes/customers';
import { devicesRouter } from './routes/devices';
import { inventoryRouter } from './routes/inventory';
import { invoicesRouter } from './routes/invoices';
import { whatsappRouter } from './routes/whatsapp';
import { reportsRouter } from './routes/reports';
import { organizationsRouter } from './routes/organizations';
import { usersRouter } from './routes/users';
import { setupSocketHandlers } from './socket';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/users', usersRouter);

// Error handling
app.use(errorHandler);

// Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Fixly API server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
});

export { app, io };
