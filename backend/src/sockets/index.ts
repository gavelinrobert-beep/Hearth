import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import { setupMessageHandlers } from './messageHandler';
import { setupPresenceHandlers } from './presenceHandler';
import { setupTypingHandlers } from './typingHandler';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export function setupSocketHandlers(io: Server) {
  // Middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.username = decoded.username;

      // Update user status to online
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { status: 'online' },
      });

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Get user's servers and join their rooms
    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId: socket.userId,
          },
        },
      },
      select: { id: true },
    });

    servers.forEach((server) => {
      socket.join(`server:${server.id}`);
    });

    // Setup all event handlers
    setupMessageHandlers(io, socket);
    setupTypingHandlers(io, socket);
    setupPresenceHandlers(io, socket, servers);
  });

  return io;
}
