import axios from 'axios';
import * as cheerio from 'cheerio';
import { ChapterContent, ApiResponse } from '@/types';
import { syosetuConfig } from '@/config';
import { createChildLogger, globalRateLimiter } from '@/utils';

const logger = createChildLogger('ScraperService');

// Pool of realistic User-Agents from popular browsers
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

// Common browser languages for Japanese users
const ACCEPT_LANGUAGES = [
  'ja,en-US;q=0.9,en;q=0.8',
  'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
  'ja,en;q=0.9',
  'ja-JP,ja;q=0.8,en-US;q=0.5,en;q=0.3',
];

// Viewport sizes for realistic browser fingerprinting
const VIEWPORT_SIZES = [
  '1920,1080',
  '1366,768',
  '1536,864',
  '1440,900',
  '1280,720',
];

/**
 * Get random element from array
 */
function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  const element = array[randomIndex];
  if (element === undefined) {
    throw new Error('Failed to get random element');
  }
  return element;
}

/**
 * Generate random delay between min and max milliseconds
 */
function getRandomDelay(min: number = 1000, max: number = 3000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate realistic browser headers
 */
function generateBrowserHeaders(): Record<string, string> {
  const userAgent = getRandomElement(USER_AGENTS);
  const acceptLanguage = getRandomElement(ACCEPT_LANGUAGES);
  const viewport = getRandomElement(VIEWPORT_SIZES);

  return {
    'User-Agent': userAgent,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': acceptLanguage,
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua':
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Viewport-Width': viewport.split(',')[0] || '1920',
  };
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Add random delay before retry (exponential backoff with jitter)
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          maxDelay
        );
        logger.debug(
          `Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms`
        );
        await sleep(delay);
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logger.error(`All ${maxRetries + 1} attempts failed:`, lastError);
        throw lastError;
      }

      // Check if error is retryable
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        // Don't retry on 404 (not found) or 401 (unauthorized)
        if (status === 404 || status === 401) {
          throw error;
        }
        // Retry on 403 (forbidden), 429 (rate limit), 5xx (server errors), timeouts
        if (
          status === 403 ||
          status === 429 ||
          (status && status >= 500) ||
          error.code === 'ECONNABORTED'
        ) {
          logger.warn(
            `Retryable error (${status || error.code}), attempt ${attempt + 1}/${maxRetries + 1}`
          );
          continue;
        }
      }

      logger.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
    }
  }

  throw lastError!;
}

/**
 * Extract clean text from HTML element while preserving Japanese novel formatting
 */
function extractCleanText($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector).first();
  if (element.length === 0) return '';

  // Remove unwanted elements but keep structure
  element.find('script, style, .ad, .advertisement, .banner').remove();

  // For Syosetu content, preserve line breaks by converting <br> to newlines
  element.find('br').replaceWith('\n');

  // Get text content
  let rawText = element.text() || '';

  // Optimized cleaning for Japanese novel content
  rawText = rawText
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines (clean but preserve paragraphs)
    .replace(/[ \t]{2,}/g, ' ') // Replace multiple spaces/tabs with single space
    .replace(/\n[ \t]*\n/g, '\n\n') // Clean empty lines with only spaces
    .replace(/^[ \t]+|[ \t]+$/gm, '') // Trim spaces at start/end of lines (keep Japanese indents 　)
    .replace(/^\n+|\n+$/g, '') // Trim newlines at start and end
    .trim();

  return rawText;
}

export class ScraperService {
  private readonly ncodeBaseUrl: string;

  constructor() {
    this.ncodeBaseUrl = syosetuConfig.ncodeBaseUrl;
  }

  async getChapterContent(
    ncode: string,
    chapterNumber: number
  ): Promise<ApiResponse<ChapterContent>> {
    const chapterUrl = `${this.ncodeBaseUrl}/${ncode}/${chapterNumber}/`;

    logger.info(
      `Fetching content for ncode: ${ncode}, chapter: ${chapterNumber} using enhanced Cheerio scraper`
    );

    try {
      // Use retry logic with exponential backoff
      const result = await retryWithBackoff(
        async () => {
          // Add rate limiting and random delay
          await globalRateLimiter.waitForRateLimit();

          // Add random delay to appear more human-like
          const randomDelay = getRandomDelay(500, 2000);
          await sleep(randomDelay);

          logger.debug(
            `Making request to: ${chapterUrl} with ${randomDelay}ms delay`
          );

          // Generate realistic browser headers
          const headers = generateBrowserHeaders();

          const response = await axios.get(chapterUrl, {
            timeout: syosetuConfig.requestTimeout,
            headers,
            // Add additional axios config for better reliability
            maxRedirects: 5,
            validateStatus: status => status < 500, // Don't throw on 4xx errors
          });

          // Check for successful response
          if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response;
        },
        3,
        1000,
        8000
      ); // max 3 retries, base delay 1s, max delay 8s

      const response = result; // Rename for clarity
      const $ = cheerio.load(response.data);

      logger.debug(
        `Response status: ${response.status}, Content-Type: ${response.headers['content-type']}`
      );

      // Check for potential blocking indicators
      const pageTitle = $('title').text().toLowerCase();
      if (
        pageTitle.includes('access denied') ||
        pageTitle.includes('blocked') ||
        pageTitle.includes('403')
      ) {
        logger.warn(`Potential blocking detected. Page title: ${pageTitle}`);
      }

      // Get chapter title - clean text only
      const title = extractCleanText($, '.novel_subtitle, .p-novel__title');

      // Get clean text content - properly formatted
      const textContent = extractCleanText($, '#novel_honbun, .p-novel__body');

      // Get publication date - clean text only
      const date = extractCleanText($, '.novel_subdate, .p-novel__date');

      // Count characters (only text, no HTML)
      const characterCount = textContent.length;

      // Estimate reading time (500 characters per minute for Japanese)
      const estimatedReadingTime = Math.ceil(characterCount / 500);

      // Enhanced content validation with debugging
      if (!textContent || textContent.length < 10) {
        logger.warn(`Content validation failed for ${chapterUrl}:`, {
          textContentLength: textContent.length,
          title,
          date,
          pageTitle,
          hasNovelHonbun: $('#novel_honbun').length > 0,
          hasNovelBody: $('.p-novel__body').length > 0,
          bodyPreview: $('body').text().substring(0, 200),
        });

        return {
          success: false,
          error: 'Không thể lấy nội dung chapter hoặc nội dung quá ngắn',
          timestamp: new Date().toISOString(),
        };
      }

      const finalResult: ApiResponse<ChapterContent> = {
        success: true,
        data: {
          ncode,
          chapterNumber,
          title: title || `Chapter ${chapterNumber}`,
          htmlContent: '', // Không trả về HTML để giảm size response
          textContent, // Text đã được làm sạch và tối ưu format
          date: date || new Date().toISOString().split('T')[0] || '',
          characterCount,
          estimatedReadingTime,
          url: chapterUrl,
        },
        timestamp: new Date().toISOString(),
      };

      logger.info(
        `Content fetched successfully for ncode: ${ncode}, chapter: ${chapterNumber}. Length: ${characterCount} chars`
      );
      return finalResult;
    } catch (error) {
      logger.error(
        `All retry attempts failed for ncode ${ncode}, chapter ${chapterNumber}:`,
        error
      );

      // Enhanced error handling with more specific messages
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;

        if (status === 404) {
          return {
            success: false,
            error: 'Chapter không tồn tại',
            timestamp: new Date().toISOString(),
          };
        }

        if (status === 403) {
          return {
            success: false,
            error:
              'Bị chặn truy cập từ server. Có thể do rate limiting hoặc geo-blocking.',
            timestamp: new Date().toISOString(),
          };
        }

        if (status === 429) {
          return {
            success: false,
            error: 'Quá nhiều requests. Vui lòng thử lại sau ít phút.',
            timestamp: new Date().toISOString(),
          };
        }

        if (status && status >= 500) {
          return {
            success: false,
            error: `Lỗi server Syosetu (${status}). Vui lòng thử lại sau.`,
            timestamp: new Date().toISOString(),
          };
        }

        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: 'Timeout khi kết nối tới Syosetu. Vui lòng thử lại.',
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: false,
          error: `HTTP ${status || 'Unknown'}: ${statusText || error.message}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: `Lỗi không xác định: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const headers = generateBrowserHeaders();
      const response = await axios.get(this.ncodeBaseUrl, {
        timeout: 5000,
        headers,
        maxRedirects: 3,
        validateStatus: status => status < 500,
      });

      const isAvailable = response.status === 200;
      logger.debug(
        `Syosetu availability check: ${isAvailable ? 'Available' : 'Unavailable'} (Status: ${response.status})`
      );

      return isAvailable;
    } catch (error) {
      logger.warn('Syosetu website not available:', error);
      return false;
    }
  }
}

export const scraperService = new ScraperService();
