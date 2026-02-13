/**
 * RoomManager handles voice room participants, transports, producers, and consumers
 */

const config = require('./config');

class VoiceRoom {
  constructor(channelId, router) {
    this.channelId = channelId;
    this.router = router;
    this.participants = new Map(); // userId -> participant data
  }

  /**
   * Add participant to room
   */
  addParticipant(userId, username) {
    if (this.participants.has(userId)) {
      return this.participants.get(userId);
    }

    const participant = {
      userId,
      username,
      transports: new Map(), // transportId -> transport
      producers: new Map(), // producerId -> producer
      consumers: new Map(), // consumerId -> consumer
    };

    this.participants.set(userId, participant);
    console.log(`✓ User ${username} joined voice channel ${this.channelId}`);
    return participant;
  }

  /**
   * Remove participant from room
   */
  removeParticipant(userId) {
    const participant = this.participants.get(userId);
    if (!participant) return;

    // Close all transports (will also close producers/consumers)
    for (const transport of participant.transports.values()) {
      transport.close();
    }

    this.participants.delete(userId);
    console.log(`✓ User ${participant.username} left voice channel ${this.channelId}`);
  }

  /**
   * Get participant
   */
  getParticipant(userId) {
    return this.participants.get(userId);
  }

  /**
   * Get all participants
   */
  getParticipants() {
    return Array.from(this.participants.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
    }));
  }

  /**
   * Create WebRTC transport for participant
   */
  async createTransport(userId, direction) {
    const participant = this.participants.get(userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const transport = await this.router.createWebRtcTransport(
      config.webRtcTransport
    );

    participant.transports.set(transport.id, transport);

    // Handle transport close
    transport.on('routerclose', () => {
      console.log(`Transport closed for user ${userId}`);
    });

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  /**
   * Connect transport with DTLS parameters
   */
  async connectTransport(userId, transportId, dtlsParameters) {
    const participant = this.participants.get(userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const transport = participant.transports.get(transportId);
    if (!transport) {
      throw new Error('Transport not found');
    }

    await transport.connect({ dtlsParameters });
  }

  /**
   * Create producer (start sending audio)
   */
  async produce(userId, transportId, kind, rtpParameters) {
    const participant = this.participants.get(userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const transport = participant.transports.get(transportId);
    if (!transport) {
      throw new Error('Transport not found');
    }

    const producer = await transport.produce({ kind, rtpParameters });
    participant.producers.set(producer.id, producer);

    producer.on('transportclose', () => {
      console.log(`Producer closed for user ${userId}`);
      participant.producers.delete(producer.id);
    });

    return producer.id;
  }

  /**
   * Create consumer (start receiving audio)
   */
  async consume(userId, producerUserId, transportId) {
    const participant = this.participants.get(userId);
    const producerParticipant = this.participants.get(producerUserId);

    if (!participant || !producerParticipant) {
      throw new Error('Participant not found');
    }

    const transport = participant.transports.get(transportId);
    if (!transport) {
      throw new Error('Transport not found');
    }

    // Get the audio producer from the other participant
    const producer = Array.from(producerParticipant.producers.values()).find(
      (p) => p.kind === 'audio'
    );

    if (!producer) {
      throw new Error('Producer not found');
    }

    // Check if router can consume
    if (
      !this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: participant.rtpCapabilities,
      })
    ) {
      throw new Error('Cannot consume');
    }

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: participant.rtpCapabilities,
      paused: false,
    });

    participant.consumers.set(consumer.id, consumer);

    consumer.on('transportclose', () => {
      participant.consumers.delete(consumer.id);
    });

    consumer.on('producerclose', () => {
      participant.consumers.delete(consumer.id);
    });

    return {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  /**
   * Set RTP capabilities for participant
   */
  setRtpCapabilities(userId, rtpCapabilities) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.rtpCapabilities = rtpCapabilities;
    }
  }

  /**
   * Get producers for a participant (for other users to consume)
   */
  getProducers(userId) {
    const participant = this.participants.get(userId);
    if (!participant) return [];
    
    return Array.from(participant.producers.values()).map((p) => ({
      id: p.id,
      kind: p.kind,
    }));
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // channelId -> VoiceRoom
  }

  /**
   * Create or get a voice room
   */
  getOrCreateRoom(channelId, router) {
    if (!this.rooms.has(channelId)) {
      this.rooms.set(channelId, new VoiceRoom(channelId, router));
    }
    return this.rooms.get(channelId);
  }

  /**
   * Get a voice room
   */
  getRoom(channelId) {
    return this.rooms.get(channelId);
  }

  /**
   * Remove a voice room if empty
   */
  removeRoomIfEmpty(channelId) {
    const room = this.rooms.get(channelId);
    if (room && room.participants.size === 0) {
      this.rooms.delete(channelId);
      console.log(`✓ Voice room ${channelId} removed (empty)`);
    }
  }

  /**
   * Close all rooms
   */
  closeAll() {
    for (const room of this.rooms.values()) {
      for (const userId of room.participants.keys()) {
        room.removeParticipant(userId);
      }
    }
    this.rooms.clear();
  }
}

module.exports = { VoiceRoom, RoomManager };
