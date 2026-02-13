/**
 * Socket.IO handlers for WebRTC voice functionality
 */

import { Server } from 'socket.io';
import { AuthenticatedSocket } from './index';
import prisma from '../config/database';

let mediaServer: any = null;
let roomManager: any = null;

/**
 * Initialize voice handlers with mediaServer and roomManager
 */
export function initVoiceHandlers(ms: any, rm: any) {
  mediaServer = ms;
  roomManager = rm;
}

/**
 * Setup voice-related socket handlers
 */
export function setupVoiceHandlers(io: Server, socket: AuthenticatedSocket) {
  /**
   * Get RTP capabilities for the router
   */
  socket.on('voice-get-rtp-capabilities', async (data, callback) => {
    try {
      const { channelId } = data;

      // Verify channel exists and is a voice channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { server: true },
      });

      if (!channel) {
        return callback({ error: 'Channel not found' });
      }

      if (channel.type !== 'voice') {
        return callback({ error: 'Not a voice channel' });
      }

      // Verify user is member of the server
      const member = await prisma.serverMember.findFirst({
        where: {
          userId: socket.userId,
          serverId: channel.serverId,
        },
      });

      if (!member) {
        return callback({ error: 'Not a member of this server' });
      }

      // Create router if it doesn't exist
      const router = await mediaServer.createRouter(channelId);

      callback({ rtpCapabilities: router.rtpCapabilities });
    } catch (error) {
      console.error('Error getting RTP capabilities:', error);
      callback({ error: 'Failed to get RTP capabilities' });
    }
  });

  /**
   * Join a voice channel
   */
  socket.on('voice-join', async (data, callback) => {
    try {
      const { channelId, rtpCapabilities } = data;

      // Verify channel exists and is a voice channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { server: true },
      });

      if (!channel) {
        return callback({ error: 'Channel not found' });
      }

      if (channel.type !== 'voice') {
        return callback({ error: 'Not a voice channel' });
      }

      // Verify user is member of the server
      const member = await prisma.serverMember.findFirst({
        where: {
          userId: socket.userId,
          serverId: channel.serverId,
        },
      });

      if (!member) {
        return callback({ error: 'Not a member of this server' });
      }

      // Get or create router
      const router = await mediaServer.createRouter(channelId);

      // Get or create room
      const room = roomManager.getOrCreateRoom(channelId, router);

      // Add participant to room
      const participant = room.addParticipant(socket.userId, socket.username);
      room.setRtpCapabilities(socket.userId, rtpCapabilities);

      // Join socket room
      socket.join(`voice:${channelId}`);

      // Notify other participants
      socket.to(`voice:${channelId}`).emit('voice-user-joined', {
        userId: socket.userId,
        username: socket.username,
      });

      // Return existing participants
      const participants = room.getParticipants().filter(
        (p: any) => p.userId !== socket.userId
      );

      callback({ participants });
    } catch (error) {
      console.error('Error joining voice:', error);
      callback({ error: 'Failed to join voice channel' });
    }
  });

  /**
   * Leave a voice channel
   */
  socket.on('voice-leave', async (data, callback) => {
    try {
      const { channelId } = data;

      if (!socket.userId) {
        return callback({ error: 'Not authenticated' });
      }

      const room = roomManager.getRoom(channelId);
      if (room) {
        room.removeParticipant(socket.userId);

        // Leave socket room
        socket.leave(`voice:${channelId}`);

        // Notify other participants
        socket.to(`voice:${channelId}`).emit('voice-user-left', {
          userId: socket.userId,
        });

        // Remove room if empty
        roomManager.removeRoomIfEmpty(channelId);
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error leaving voice:', error);
      callback({ error: 'Failed to leave voice channel' });
    }
  });

  /**
   * Create WebRTC transport
   */
  socket.on('voice-create-transport', async (data, callback) => {
    try {
      const { channelId, direction } = data;

      const room = roomManager.getRoom(channelId);
      if (!room) {
        return callback({ error: 'Not in voice channel' });
      }

      const transportOptions = await room.createTransport(
        socket.userId,
        direction
      );

      callback({ transportOptions });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: 'Failed to create transport' });
    }
  });

  /**
   * Connect WebRTC transport
   */
  socket.on('voice-connect-transport', async (data, callback) => {
    try {
      const { channelId, transportId, dtlsParameters } = data;

      const room = roomManager.getRoom(channelId);
      if (!room) {
        return callback({ error: 'Not in voice channel' });
      }

      await room.connectTransport(socket.userId, transportId, dtlsParameters);

      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ error: 'Failed to connect transport' });
    }
  });

  /**
   * Start producing audio
   */
  socket.on('voice-produce', async (data, callback) => {
    try {
      const { channelId, transportId, kind, rtpParameters } = data;

      const room = roomManager.getRoom(channelId);
      if (!room) {
        return callback({ error: 'Not in voice channel' });
      }

      const producerId = await room.produce(
        socket.userId,
        transportId,
        kind,
        rtpParameters
      );

      // Notify other participants about new producer
      socket.to(`voice:${channelId}`).emit('voice-new-producer', {
        userId: socket.userId,
        producerId,
      });

      callback({ producerId });
    } catch (error) {
      console.error('Error producing:', error);
      callback({ error: 'Failed to produce audio' });
    }
  });

  /**
   * Start consuming audio from another participant
   */
  socket.on('voice-consume', async (data, callback) => {
    try {
      const { channelId, producerUserId, transportId } = data;

      const room = roomManager.getRoom(channelId);
      if (!room) {
        return callback({ error: 'Not in voice channel' });
      }

      const consumerOptions = await room.consume(
        socket.userId,
        producerUserId,
        transportId
      );

      callback({ consumerOptions });
    } catch (error) {
      console.error('Error consuming:', error);
      callback({ error: 'Failed to consume audio' });
    }
  });

  /**
   * Handle disconnect - cleanup voice state
   */
  socket.on('disconnect', async () => {
    if (!socket.userId) return;
    
    // Find all rooms this user is in and remove them
    for (const [channelId, room] of roomManager.rooms.entries()) {
      if (room.getParticipant(socket.userId)) {
        room.removeParticipant(socket.userId);

        // Notify other participants
        socket.to(`voice:${channelId}`).emit('voice-user-left', {
          userId: socket.userId,
        });

        // Remove room if empty
        roomManager.removeRoomIfEmpty(channelId);
      }
    }
  });
}
