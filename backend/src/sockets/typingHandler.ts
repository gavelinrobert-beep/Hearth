import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import redisClient from '../config/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export async function setupTypingHandlers(
  io: Server,
  socket: AuthenticatedSocket
) {
  // Handle typing start
  socket.on('typing-start', async (channelId: string) => {
    try {
      if (!socket.userId) return;

      await prisma.typingStatus.upsert({
        where: {
          userId_channelId: {
            userId: socket.userId,
            channelId,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          userId: socket.userId,
          channelId,
        },
      });

      socket.to(`channel:${channelId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        channelId,
      });

      // Store timeout in Redis
      await redisClient.setEx(
        `typing:${socket.userId}:${channelId}`,
        5,
        'true'
      );
    } catch (error) {
      console.error('Typing start error:', error);
    }
  });

  // Handle typing stop
  socket.on('typing-stop', async (channelId: string) => {
    try {
      if (!socket.userId) return;

      await prisma.typingStatus.deleteMany({
        where: {
          userId: socket.userId,
          channelId,
        },
      });

      socket.to(`channel:${channelId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        channelId,
      });

      await redisClient.del(`typing:${socket.userId}:${channelId}`);
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  });
}
