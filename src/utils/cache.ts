import NodeCache from 'node-cache';
import { cacheConfig } from '@/config';
import { createChildLogger } from './logger';

const logger = createChildLogger('Cache');

export class CacheManager {
  private metadataCache: NodeCache;
  private contentCache: NodeCache;

  constructor() {
    this.metadataCache = new NodeCache({
      stdTTL: cacheConfig.metadata.ttl,
      checkperiod: 120, // Check for expired keys every 2 minutes
    });

    this.contentCache = new NodeCache({
      stdTTL: cacheConfig.content.ttl,
      checkperiod: 300, // Check for expired keys every 5 minutes
    });

    // Log cache events
    this.metadataCache.on('set', (key, _value) => {
      logger.debug(`Metadata cached: ${key}`);
    });

    this.contentCache.on('set', (key, _value) => {
      logger.debug(`Content cached: ${key}`);
    });

    this.metadataCache.on('expired', (key, _value) => {
      logger.debug(`Metadata cache expired: ${key}`);
    });

    this.contentCache.on('expired', (key, _value) => {
      logger.debug(`Content cache expired: ${key}`);
    });
  }

  // Metadata cache methods
  getMetadata<T>(key: string): T | undefined {
    return this.metadataCache.get<T>(key);
  }

  setMetadata<T>(key: string, value: T, ttl?: number): boolean {
    return ttl
      ? this.metadataCache.set(key, value, ttl)
      : this.metadataCache.set(key, value);
  }

  deleteMetadata(key: string): number {
    return this.metadataCache.del(key);
  }

  // Content cache methods
  getContent<T>(key: string): T | undefined {
    return this.contentCache.get<T>(key);
  }

  setContent<T>(key: string, value: T, ttl?: number): boolean {
    return ttl
      ? this.contentCache.set(key, value, ttl)
      : this.contentCache.set(key, value);
  }

  deleteContent(key: string): number {
    return this.contentCache.del(key);
  }

  // Utility methods
  flushAll(): void {
    this.metadataCache.flushAll();
    this.contentCache.flushAll();
    logger.info('All caches flushed');
  }

  getStats(): { metadata: NodeCache.Stats; content: NodeCache.Stats } {
    return {
      metadata: this.metadataCache.getStats(),
      content: this.contentCache.getStats(),
    };
  }

  // Generate cache keys
  static generateMetadataKey(ncode: string): string {
    return `metadata_${ncode.toLowerCase()}`;
  }

  static generateContentKey(ncode: string, chapter: number): string {
    return `content_${ncode.toLowerCase()}_${chapter}`;
  }

  static generateSearchKey(
    keyword: string,
    options: Record<string, unknown>
  ): string {
    const optionsStr = JSON.stringify(options);
    return `search_${keyword}_${Buffer.from(optionsStr).toString('base64')}`;
  }

  static generateRankingKey(options: Record<string, unknown>): string {
    const optionsStr = JSON.stringify(options);
    return `ranking_${Buffer.from(optionsStr).toString('base64')}`;
  }
}

export const cacheManager = new CacheManager();
