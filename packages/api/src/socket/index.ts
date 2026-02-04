import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
}

export function setupSocketHandlers(io: SocketServer) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyToken(token);
      socket.userId = payload.userId;
      socket.organizationId = payload.organizationId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join organization room
    if (socket.organizationId) {
      socket.join(`org:${socket.organizationId}`);
      logger.info(`Socket ${socket.id} joined org:${socket.organizationId}`);
    }

    // Join user-specific room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining ticket-specific rooms
    socket.on('ticket:join', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      logger.info(`Socket ${socket.id} joined ticket:${ticketId}`);
    });

    socket.on('ticket:leave', (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      logger.info(`Socket ${socket.id} left ticket:${ticketId}`);
    });

    // Handle conversation rooms
    socket.on('conversation:join', (customerId: string) => {
      socket.join(`conversation:${customerId}`);
    });

    socket.on('conversation:leave', (customerId: string) => {
      socket.leave(`conversation:${customerId}`);
    });

    // Typing indicators for messages
    socket.on('typing:start', (ticketId: string) => {
      socket.to(`ticket:${ticketId}`).emit('typing:start', {
        userId: socket.userId,
        ticketId,
      });
    });

    socket.on('typing:stop', (ticketId: string) => {
      socket.to(`ticket:${ticketId}`).emit('typing:stop', {
        userId: socket.userId,
        ticketId,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  // Helper function to emit to organization
  io.emitToOrganization = (organizationId: string, event: string, data: any) => {
    io.to(`org:${organizationId}`).emit(event, data);
  };

  // Helper function to emit to user
  io.emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Helper function to emit to ticket room
  io.emitToTicket = (ticketId: string, event: string, data: any) => {
    io.to(`ticket:${ticketId}`).emit(event, data);
  };

  return io;
}

// Extend Socket.io Server type
declare module 'socket.io' {
  interface Server {
    emitToOrganization: (organizationId: string, event: string, data: any) => void;
    emitToUser: (userId: string, event: string, data: any) => void;
    emitToTicket: (ticketId: string, event: string, data: any) => void;
  }
}
