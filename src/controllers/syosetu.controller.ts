import { FastifyReply } from 'fastify';
import {
  NovelParams,
  ChapterParams,
  MultipleChaptersRequest,
  SearchQuery,
  RankingQuery,
  TypedRequestWithParams,
  TypedRequestFull,
} from '@/types';
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendInternalError,
  createChildLogger,
  validateNcode,
  validateChapterNumber,
  validateSearchOrder,
  validateRankingOrder,
  validateLimit,
  validateStartPosition,
  validateGzipLevel,
} from '@/utils';
import { syosetuService } from '@/services';

const logger = createChildLogger('SyosetuController');

export class SyosetuController {
  async getNovelDetails(
    request: TypedRequestWithParams<unknown, NovelParams>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { ncode } = request.params;

      if (!validateNcode(ncode)) {
        sendError(reply, 'Ncode không hợp lệ (chỉ chấp nhận chữ và số)', 400);
        return;
      }

      logger.info(`Getting novel details for ncode: ${ncode}`);
      const result = await syosetuService.getNovelMetadata(ncode);

      if (result.success) {
        sendSuccess(reply, result.data, 'Lấy thông tin tiểu thuyết thành công');
      } else {
        sendNotFound(reply, 'Tiểu thuyết');
      }
    } catch (error) {
      logger.error('Error in getNovelDetails:', error);
      sendInternalError(reply, 'Lỗi server khi lấy thông tin tiểu thuyết');
    }
  }

  async getChapterContent(
    request: TypedRequestWithParams<unknown, ChapterParams>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { ncode, chapter } = request.params;

      if (!validateNcode(ncode)) {
        sendError(reply, 'Ncode không hợp lệ', 400);
        return;
      }

      const chapterNumber = validateChapterNumber(chapter);
      if (chapterNumber === null) {
        sendError(reply, 'Chapter phải là số nguyên dương', 400);
        return;
      }

      logger.info(
        `Getting chapter content for ncode: ${ncode}, chapter: ${chapterNumber}`
      );
      const result = await syosetuService.getChapterContent(
        ncode,
        chapterNumber
      );

      if (result.success) {
        sendSuccess(reply, result.data, 'Lấy nội dung chapter thành công');
      } else {
        sendNotFound(reply, 'Chapter');
      }
    } catch (error) {
      logger.error('Error in getChapterContent:', error);
      sendInternalError(reply, 'Lỗi server khi lấy nội dung chapter');
    }
  }

  async getMultipleChapters(
    request: TypedRequestFull<MultipleChaptersRequest, NovelParams>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { ncode } = request.params;
      const { chapters } = request.body;

      if (!validateNcode(ncode)) {
        sendError(reply, 'Ncode không hợp lệ', 400);
        return;
      }

      if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
        sendError(reply, 'Chapters phải là array không rỗng', 400);
        return;
      }

      if (chapters.length > 10) {
        sendError(reply, 'Tối đa 10 chapters mỗi lần', 400);
        return;
      }

      // Validate chapter numbers
      for (const chapter of chapters) {
        if (typeof chapter !== 'number' || chapter < 1) {
          sendError(reply, `Chapter ${chapter} không hợp lệ`, 400);
          return;
        }
      }

      logger.info(
        `Getting multiple chapters for ncode: ${ncode}, chapters: ${chapters.join(', ')}`
      );

      // Fetch chapters concurrently
      const results = await Promise.all(
        chapters.map(chapter =>
          syosetuService.getChapterContent(ncode, chapter)
        )
      );

      const successfulResults = results.filter(result => result.success);
      const failedResults = results.filter(result => !result.success);

      sendSuccess(
        reply,
        {
          ncode,
          totalRequested: chapters.length,
          successful: successfulResults.length,
          failed: failedResults.length,
          chapters: successfulResults.map(result => result.data),
          errors: failedResults.map(result => result.error),
        },
        'Lấy nhiều chapter hoàn tất'
      );
    } catch (error) {
      logger.error('Error in getMultipleChapters:', error);
      sendInternalError(reply, 'Lỗi server khi lấy nhiều chapter');
    }
  }

  async searchNovels(
    request: TypedRequestFull<unknown, unknown, SearchQuery>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const {
        keyword,
        order = 'new',
        limit = '20',
        start,
        gzip,
        ...otherOptions
      } = request.query;

      if (!keyword) {
        sendError(reply, 'Keyword là bắt buộc', 400);
        return;
      }

      // Validate order
      if (!validateSearchOrder(order)) {
        sendError(reply, 'Order không hợp lệ', 400, {
          validOrders: {
            new: 'Mới nhất',
            favnovelcnt: 'Bookmark nhiều nhất',
            reviewcnt: 'Review nhiều nhất',
            hyoka: 'Điểm cao nhất',
            weeklypoint: 'Điểm tuần',
            monthlypoint: 'Điểm tháng',
            yearlypoint: 'Điểm năm',
            weekly: 'Weekly unique users',
          },
        });
        return;
      }

      // Validate limit
      const limitNum = parseInt(limit, 10);
      if (!validateLimit(limitNum, 500)) {
        sendError(reply, 'Limit phải từ 1 đến 500', 400);
        return;
      }

      // Validate start position
      if (start) {
        const startNum = parseInt(start, 10);
        if (!validateStartPosition(startNum)) {
          sendError(reply, 'Start position phải từ 1 đến 2000', 400);
          return;
        }
      }

      // Validate gzip level
      if (gzip) {
        const gzipNum = parseInt(gzip, 10);
        if (!validateGzipLevel(gzipNum)) {
          sendError(reply, 'Gzip level phải từ 1 đến 5', 400);
          return;
        }
      }

      const options = {
        order,
        limit: limitNum,
        ...(start && { start: parseInt(start, 10) }),
        ...(gzip && { gzip: parseInt(gzip, 10) }),
        ...Object.fromEntries(
          Object.entries(otherOptions).map(([key, value]) => [
            key,
            typeof value === 'string' && /^\d+$/.test(value)
              ? parseInt(value, 10)
              : value,
          ])
        ),
      };

      logger.info(`Searching novels with keyword: ${keyword}`);
      const result = await syosetuService.searchNovels(keyword, options);

      if (result.success) {
        sendSuccess(reply, result.data, 'Tìm kiếm thành công');
      } else {
        sendError(reply, result.error || 'Lỗi khi tìm kiếm', 500);
      }
    } catch (error) {
      logger.error('Error in searchNovels:', error);
      sendInternalError(reply, 'Lỗi server khi tìm kiếm tiểu thuyết');
    }
  }

  async getRanking(
    request: TypedRequestFull<unknown, unknown, RankingQuery>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { order = 'hyoka', biggenre, genre, limit = '50' } = request.query;

      // Validate order
      if (!validateRankingOrder(order)) {
        sendError(reply, 'Order không hợp lệ cho ranking', 400, {
          validOrders: {
            hyoka: 'Điểm đánh giá cao nhất',
            favnovelcnt: 'Bookmark nhiều nhất',
            weeklypoint: 'Điểm tuần cao nhất',
            monthlypoint: 'Điểm tháng cao nhất',
          },
        });
        return;
      }

      // Validate limit
      const limitNum = parseInt(limit, 10);
      if (!validateLimit(limitNum, 100)) {
        sendError(reply, 'Limit phải từ 1 đến 100', 400);
        return;
      }

      const options = {
        order,
        limit: limitNum,
        ...(biggenre && { biggenre }),
        ...(genre && { genre }),
      };

      logger.info('Getting ranking');
      const result = await syosetuService.getRanking(options);

      if (result.success) {
        sendSuccess(reply, result.data, 'Lấy ranking thành công');
      } else {
        sendError(reply, result.error || 'Lỗi khi lấy ranking', 500);
      }
    } catch (error) {
      logger.error('Error in getRanking:', error);
      sendInternalError(reply, 'Lỗi server khi lấy ranking');
    }
  }
}

export const syosetuController = new SyosetuController();
