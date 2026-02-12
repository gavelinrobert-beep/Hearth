import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import { moderateContent } from '../services/aiModeration';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export async function setupMessageHandlers(
  io: Server,
  socket: AuthenticatedSocket
) {
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

  // Handle editing a message
  socket.on('edit-message', async (data: {
    messageId: string;
    content: string;
  }) => {
    try {
      const { messageId, content } = data;

      if (!socket.userId) return;

      // Verify message belongs to user
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          userId: socket.userId,
        },
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Moderate content with AI
      const moderationResult = await moderateContent(content);

      // Update message
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          moderated: moderationResult.shouldBlock,
          updatedAt: new Date(),
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

      // Broadcast updated message to channel
      io.to(`channel:${message.channelId}`).emit('message-updated', updatedMessage);

      // If moderated, notify the sender
      if (moderationResult.shouldBlock) {
        socket.emit('message-moderated', {
          messageId: updatedMessage.id,
          reason: moderationResult.reason,
        });
      }
    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Handle deleting a message
  socket.on('delete-message', async (messageId: string) => {
    try {
      if (!socket.userId) return;

      // Verify message belongs to user
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          userId: socket.userId,
        },
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Delete message
      await prisma.message.delete({
        where: { id: messageId },
      });

      // Broadcast deleted message to channel
      io.to(`channel:${message.channelId}`).emit('message-deleted', {
        messageId,
        channelId: message.channelId,
      });
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
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
}
