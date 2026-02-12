import { Server, Socket } from 'socket.io';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export async function setupPresenceHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  servers: Array<{ id: string }>
) {
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
}
