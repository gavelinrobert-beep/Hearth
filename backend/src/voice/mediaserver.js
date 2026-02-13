/**
 * MediaServer manages mediasoup workers and routers
 */

const mediasoup = require('mediasoup');
const config = require('./config');

class MediaServer {
  constructor() {
    this.workers = [];
    this.nextWorkerIdx = 0;
    this.routers = new Map(); // channelId -> router
  }

  /**
   * Initialize mediasoup workers
   */
  async init(numWorkers = 1) {
    console.log(`Initializing ${numWorkers} mediasoup worker(s)...`);
    
    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: config.worker.logLevel,
        logTags: config.worker.logTags,
        rtcMinPort: config.worker.rtcMinPort,
        rtcMaxPort: config.worker.rtcMaxPort,
      });

      worker.on('died', () => {
        console.error(`mediasoup worker died [pid:${worker.pid}]`);
        process.exit(1);
      });

      this.workers.push(worker);
      console.log(`✓ mediasoup worker created [pid:${worker.pid}]`);
    }
  }

  /**
   * Get next worker using round-robin
   */
  getWorker() {
    const worker = this.workers[this.nextWorkerIdx];
    this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    return worker;
  }

  /**
   * Create a router for a voice channel
   */
  async createRouter(channelId) {
    if (this.routers.has(channelId)) {
      return this.routers.get(channelId);
    }

    const worker = this.getWorker();
    const router = await worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });

    this.routers.set(channelId, router);
    console.log(`✓ Router created for channel ${channelId}`);
    return router;
  }

  /**
   * Get router for a voice channel
   */
  getRouter(channelId) {
    return this.routers.get(channelId);
  }

  /**
   * Close router for a voice channel
   */
  async closeRouter(channelId) {
    const router = this.routers.get(channelId);
    if (router) {
      router.close();
      this.routers.delete(channelId);
      console.log(`✓ Router closed for channel ${channelId}`);
    }
  }

  /**
   * Close all routers and workers
   */
  async close() {
    for (const router of this.routers.values()) {
      router.close();
    }
    this.routers.clear();

    for (const worker of this.workers) {
      worker.close();
    }
    this.workers = [];
  }
}

module.exports = MediaServer;
