/**
 * VoiceService handles WebRTC connections using mediasoup-client
 */

import { Device } from 'mediasoup-client';
import { Transport, Producer, Consumer } from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import { VoiceParticipant } from '../types';

interface VoiceCallbacks {
  onUserJoined?: (participant: VoiceParticipant) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class VoiceService {
  private socket: Socket | null = null;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private audioStream: MediaStream | null = null;
  private currentChannelId: string | null = null;
  private callbacks: VoiceCallbacks = {};

  constructor() {
    this.device = new Device();
  }

  /**
   * Initialize voice service with socket
   */
  init(socket: Socket, callbacks: VoiceCallbacks = {}) {
    this.socket = socket;
    this.callbacks = callbacks;
    this.setupSocketListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('voice-user-joined', (data: VoiceParticipant) => {
      console.log('User joined voice:', data);
      this.callbacks.onUserJoined?.(data);
    });

    this.socket.on('voice-user-left', (data: { userId: string }) => {
      console.log('User left voice:', data);
      this.callbacks.onUserLeft?.(data.userId);
      
      // Close consumer for this user
      this.consumers.forEach((consumer, consumerId) => {
        if (consumer.appData.userId === data.userId) {
          consumer.close();
          this.consumers.delete(consumerId);
        }
      });
    });

    this.socket.on('voice-new-producer', async (data: { userId: string; producerId: string }) => {
      console.log('New producer:', data);
      // Consume the new producer
      if (this.recvTransport && this.currentChannelId) {
        await this.consumeAudio(data.userId);
      }
    });
  }

  /**
   * Join a voice channel
   */
  async joinChannel(channelId: string): Promise<void> {
    try {
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }

      this.currentChannelId = channelId;

      // Get RTP capabilities
      const { rtpCapabilities, error: rtpError } = await this.socketRequest(
        'voice-get-rtp-capabilities',
        { channelId }
      );

      if (rtpError) {
        throw new Error(rtpError);
      }

      // Load device with RTP capabilities
      if (!this.device!.loaded) {
        await this.device!.load({ routerRtpCapabilities: rtpCapabilities });
      }

      // Join the voice channel
      const { participants, error: joinError } = await this.socketRequest(
        'voice-join',
        {
          channelId,
          rtpCapabilities: this.device!.rtpCapabilities,
        }
      );

      if (joinError) {
        throw new Error(joinError);
      }

      // Create transports
      await this.createSendTransport(channelId);
      await this.createRecvTransport(channelId);

      // Get microphone stream
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Start producing audio
      await this.produceAudio();

      // Consume audio from existing participants
      for (const participant of participants) {
        await this.consumeAudio(participant.userId);
      }

      this.callbacks.onConnected?.();
    } catch (error) {
      console.error('Error joining voice channel:', error);
      this.callbacks.onError?.(
        error instanceof Error ? error.message : 'Failed to join voice channel'
      );
      throw error;
    }
  }

  /**
   * Leave current voice channel
   */
  async leaveChannel(): Promise<void> {
    try {
      if (!this.socket || !this.currentChannelId) {
        return;
      }

      const channelId = this.currentChannelId;
      this.currentChannelId = null;

      // Stop audio stream
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop());
        this.audioStream = null;
      }

      // Close producer
      if (this.producer) {
        this.producer.close();
        this.producer = null;
      }

      // Close consumers
      this.consumers.forEach((consumer) => consumer.close());
      this.consumers.clear();

      // Close transports
      if (this.sendTransport) {
        this.sendTransport.close();
        this.sendTransport = null;
      }

      if (this.recvTransport) {
        this.recvTransport.close();
        this.recvTransport = null;
      }

      // Notify server
      await this.socketRequest('voice-leave', { channelId });

      this.callbacks.onDisconnected?.();
    } catch (error) {
      console.error('Error leaving voice channel:', error);
    }
  }

  /**
   * Create send transport
   */
  private async createSendTransport(channelId: string): Promise<void> {
    const { transportOptions, error } = await this.socketRequest(
      'voice-create-transport',
      { channelId, direction: 'send' }
    );

    if (error) {
      throw new Error(error);
    }

    this.sendTransport = this.device!.createSendTransport(transportOptions);

    this.sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        const { error } = await this.socketRequest('voice-connect-transport', {
          channelId,
          transportId: this.sendTransport!.id,
          dtlsParameters,
        });

        if (error) {
          errback(new Error(error));
        } else {
          callback();
        }
      } catch (error) {
        errback(error as Error);
      }
    });

    this.sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
      try {
        const { producerId, error } = await this.socketRequest('voice-produce', {
          channelId,
          transportId: this.sendTransport!.id,
          kind,
          rtpParameters,
        });

        if (error) {
          errback(new Error(error));
        } else {
          callback({ id: producerId });
        }
      } catch (error) {
        errback(error as Error);
      }
    });
  }

  /**
   * Create receive transport
   */
  private async createRecvTransport(channelId: string): Promise<void> {
    const { transportOptions, error } = await this.socketRequest(
      'voice-create-transport',
      { channelId, direction: 'recv' }
    );

    if (error) {
      throw new Error(error);
    }

    this.recvTransport = this.device!.createRecvTransport(transportOptions);

    this.recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        const { error } = await this.socketRequest('voice-connect-transport', {
          channelId,
          transportId: this.recvTransport!.id,
          dtlsParameters,
        });

        if (error) {
          errback(new Error(error));
        } else {
          callback();
        }
      } catch (error) {
        errback(error as Error);
      }
    });
  }

  /**
   * Produce audio (send microphone)
   */
  private async produceAudio(): Promise<void> {
    if (!this.sendTransport || !this.audioStream) {
      throw new Error('Send transport or audio stream not available');
    }

    const audioTrack = this.audioStream.getAudioTracks()[0];
    this.producer = await this.sendTransport.produce({
      track: audioTrack,
    });

    console.log('Audio producer created:', this.producer.id);
  }

  /**
   * Consume audio from another participant
   */
  private async consumeAudio(producerUserId: string): Promise<void> {
    try {
      if (!this.recvTransport || !this.currentChannelId) {
        return;
      }

      const { consumerOptions, error } = await this.socketRequest('voice-consume', {
        channelId: this.currentChannelId,
        producerUserId,
        transportId: this.recvTransport.id,
      });

      if (error) {
        console.error('Error consuming audio:', error);
        return;
      }

      const consumer = await this.recvTransport.consume({
        id: consumerOptions.id,
        producerId: consumerOptions.producerId,
        kind: consumerOptions.kind,
        rtpParameters: consumerOptions.rtpParameters,
      });

      consumer.appData = { userId: producerUserId };

      // Play the audio
      const stream = new MediaStream([consumer.track]);
      const audio = new Audio();
      audio.srcObject = stream;
      audio.play().catch((err) => console.error('Error playing audio:', err));

      this.consumers.set(consumer.id, consumer);
      console.log('Audio consumer created:', consumer.id);
    } catch (error) {
      console.error('Error consuming audio:', error);
    }
  }

  /**
   * Mute/unmute microphone
   */
  setMuted(muted: boolean) {
    if (this.producer) {
      if (muted) {
        this.producer.pause();
      } else {
        this.producer.resume();
      }
    }
  }

  /**
   * Check if currently muted
   */
  isMuted(): boolean {
    return this.producer ? this.producer.paused : true;
  }

  /**
   * Helper to make socket requests with promises
   */
  private socketRequest(event: string, data: any): Promise<any> {
    return new Promise((resolve) => {
      this.socket!.emit(event, data, (response: any) => {
        resolve(response);
      });
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.leaveChannel();
    this.socket = null;
    this.callbacks = {};
  }
}

export default VoiceService;
