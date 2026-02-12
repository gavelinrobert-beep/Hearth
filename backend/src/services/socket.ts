import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import redisClient from '../config/redis';
import { moderateContent } from './aiModeration';

interface AuthenticatedSocket extends Socket {
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

    // Handle joining a channel
    socket.on('join-channel', async (channelId: string) => {
      try {
        // Verify user has access to channel
        const channel = await prisma.channel.findFirst({
          where: {
            id: channelId,
            server: {
              members: {
                some: {
                  userId: socket.userId,
                },
              },
            },
          },
        });

        if (channel) {
          socket.join(`channel:${channelId}`);
          console.log(`${socket.username} joined channel ${channelId}`);
        }
      } catch (error) {
        console.error('Join channel error:', error);
      }
    });

    // Handle leaving a channel
    socket.on('leave-channel', (channelId: string) => {
      socket.leave(`channel:${channelId}`);
      console.log(`${socket.username} left channel ${channelId}`);
    });

    // Handle sending a message
    socket.on('send-message', async (data: {
      channelId: string;
      content: string;
    }) => {
      try {
        const { channelId, content } = data;

        if (!socket.userId) return;

        // Verify user has access to channel
        const channel = await prisma.channel.findFirst({
          where: {
            id: channelId,
            server: {
              members: {
                some: {
                  userId: socket.userId,
                },
              },
            },
          },
        });

        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return;
        }

        // Moderate content with AI
        const moderationResult = await moderateContent(content);

        // Create message
        const message = await prisma.message.create({
          data: {
            content,
            userId: socket.userId,
            channelId,
            moderated: moderationResult.shouldBlock,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });

        // Broadcast message to channel
        io.to(`channel:${channelId}`).emit('new-message', message);

        // If moderated, notify the sender
        if (moderationResult.shouldBlock) {
          socket.emit('message-moderated', {
            messageId: message.id,
            reason: moderationResult.reason,
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
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

    // Handle direct messages
    socket.on('send-dm', async (data: {
      receiverId: string;
      content: string;
    }) => {
      try {
        const { receiverId, content } = data;

        if (!socket.userId) return;

        const message = await prisma.directMessage.create({
          data: {
            content,
            senderId: socket.userId,
            receiverId,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });

        // Send to both sender and receiver
        io.to(`user:${receiverId}`).emit('new-dm', message);
        socket.emit('new-dm', message);
      } catch (error) {
        console.error('Send DM error:', error);
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Handle user status updates
    socket.on('update-status', async (status: string) => {
      try {
        if (!socket.userId) return;

        await prisma.user.update({
          where: { id: socket.userId },
          data: { status },
        });

        // Broadcast status update to all servers the user is in
        servers.forEach((server) => {
          io.to(`server:${server.id}`).emit('user-status-update', {
            userId: socket.userId,
            status,
          });
        });
      } catch (error) {
        console.error('Update status error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username}`);

      try {
        if (!socket.userId) return;

        // Update user status to offline
        await prisma.user.update({
          where: { id: socket.userId },
          data: { status: 'offline' },
        });

        // Clean up typing status
        await prisma.typingStatus.deleteMany({
          where: {
            userId: socket.userId,
          },
        });

        // Broadcast status update
        servers.forEach((server) => {
          io.to(`server:${server.id}`).emit('user-status-update', {
            userId: socket.userId,
            status: 'offline',
          });
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
}
