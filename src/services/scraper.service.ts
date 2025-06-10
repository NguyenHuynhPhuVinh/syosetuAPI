import axios from 'axios';
import * as cheerio from 'cheerio';
import { ChapterContent, ApiResponse } from '@/types';
import { syosetuConfig } from '@/config';
import { createChildLogger, globalRateLimiter } from '@/utils';

const logger = createChildLogger('ScraperService');

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
    try {
      await globalRateLimiter.waitForRateLimit();

      logger.info(
        `Fetching content for ncode: ${ncode}, chapter: ${chapterNumber} using Cheerio`
      );

      const chapterUrl = `${this.ncodeBaseUrl}/${ncode}/${chapterNumber}/`;

      const response = await axios.get(chapterUrl, {
        timeout: syosetuConfig.requestTimeout,
        headers: {
          'User-Agent': syosetuConfig.userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      const $ = cheerio.load(response.data);

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

      // Validate that we got meaningful content
      if (!textContent || textContent.length < 10) {
        return {
          success: false,
          error: 'Không thể lấy nội dung chapter hoặc nội dung quá ngắn',
          timestamp: new Date().toISOString(),
        };
      }

      const result: ApiResponse<ChapterContent> = {
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
        `Content fetched successfully for ncode: ${ncode}, chapter: ${chapterNumber} using Cheerio`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error fetching content for ncode ${ncode}, chapter ${chapterNumber}:`,
        error
      );

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            error: 'Chapter không tồn tại',
            timestamp: new Date().toISOString(),
          };
        }
        if (error.response?.status === 403) {
          return {
            success: false,
            error: 'Bị chặn truy cập, vui lòng thử lại sau',
            timestamp: new Date().toISOString(),
          };
        }
      }

      return {
        success: false,
        error: `Lỗi khi lấy nội dung chapter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(this.ncodeBaseUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': syosetuConfig.userAgent,
        },
      });
      return response.status === 200;
    } catch (error) {
      logger.warn('Syosetu website not available:', error);
      return false;
    }
  }
}

export const scraperService = new ScraperService();
