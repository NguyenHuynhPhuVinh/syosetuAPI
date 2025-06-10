import { createChildLogger } from './logger';

const logger = createChildLogger('RateLimiter');

export class RateLimiter {
  private lastRequestTime: number = 0;
  private readonly minInterval: number;

  constructor(minInterval: number = 1000) {
    this.minInterval = minInterval;
  }

  async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      logger.debug(`Rate limiting: waiting ${waitTime}ms`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  getLastRequestTime(): number {
    return this.lastRequestTime;
  }

  getMinInterval(): number {
    return this.minInterval;
  }
}

export const globalRateLimiter = new RateLimiter(1000); // 1 second between requests
