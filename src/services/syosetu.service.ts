import axios, { AxiosResponse } from 'axios';
import {
  NovelMetadata,
  ChapterContent,
  SearchOptions,
  SearchResponse,
  RankingOptions,
  RankingResponse,
  ApiResponse,
} from '@/types';
import { syosetuConfig } from '@/config';
import {
  createChildLogger,
  cacheManager,
  CacheManager,
  globalRateLimiter,
} from '@/utils';
import { scraperService } from './scraper.service';

const logger = createChildLogger('SyosetuService');

export class SyosetuService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = syosetuConfig.apiBaseUrl;
  }

  async getNovelMetadata(ncode: string): Promise<ApiResponse<NovelMetadata>> {
    const cacheKey = CacheManager.generateMetadataKey(ncode);
    const cached =
      cacheManager.getMetadata<ApiResponse<NovelMetadata>>(cacheKey);

    if (cached) {
      logger.debug(`Metadata cache hit for ncode: ${ncode}`);
      return cached;
    }

    try {
      await globalRateLimiter.waitForRateLimit();

      logger.info(`Fetching metadata for ncode: ${ncode}`);

      const response: AxiosResponse = await axios.get(this.apiBaseUrl, {
        params: {
          out: 'json',
          ncode: ncode.toUpperCase(),
          of: 't-w-s-bg-g-k-gf-gl-nt-e-ga-l-ti-f-imp-r-a-ah',
        },
        timeout: syosetuConfig.requestTimeout,
      });

      if (response.data && response.data.length > 1) {
        const novel = response.data[1]; // [0] is allcount, [1] is data
        const result: ApiResponse<NovelMetadata> = {
          success: true,
          data: {
            ncode: novel.ncode,
            title: novel.title,
            author: novel.writer,
            summary: novel.story,
            biggenre: novel.biggenre,
            genre: novel.genre,
            keywords: novel.keyword,
            firstPublished: novel.general_firstup,
            lastUpdated: novel.general_lastup,
            novelType: novel.noveltype,
            isCompleted: novel.end === 0,
            totalChapters: novel.general_all_no,
            wordCount: novel.length,
            readingTime: novel.time,
            bookmarks: novel.fav_novel_cnt,
            impressions: novel.impression_cnt,
            reviews: novel.review_cnt,
            points: novel.all_point,
            raters: novel.all_hyoka_cnt,
          },
          timestamp: new Date().toISOString(),
        };

        cacheManager.setMetadata(cacheKey, result);
        logger.info(`Metadata fetched successfully for ncode: ${ncode}`);
        return result;
      } else {
        const result: ApiResponse<NovelMetadata> = {
          success: false,
          error: 'Không tìm thấy tiểu thuyết với ncode này',
          timestamp: new Date().toISOString(),
        };
        return result;
      }
    } catch (error) {
      logger.error(`Error fetching metadata for ncode ${ncode}:`, error);
      return {
        success: false,
        error: `Lỗi khi lấy metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getChapterContent(
    ncode: string,
    chapterNumber: number
  ): Promise<ApiResponse<ChapterContent>> {
    const cacheKey = CacheManager.generateContentKey(ncode, chapterNumber);
    const cached =
      cacheManager.getContent<ApiResponse<ChapterContent>>(cacheKey);

    if (cached) {
      logger.debug(
        `Content cache hit for ncode: ${ncode}, chapter: ${chapterNumber}`
      );
      return cached;
    }

    // Use Cheerio for all environments (optimized for serverless)
    logger.info(
      `Fetching content for ncode: ${ncode}, chapter: ${chapterNumber} using Cheerio`
    );

    const result = await scraperService.getChapterContent(ncode, chapterNumber);

    if (result.success) {
      cacheManager.setContent(cacheKey, result);
      logger.info(
        `Content fetched successfully for ncode: ${ncode}, chapter: ${chapterNumber}`
      );
    }

    return result;
  }

  async searchNovels(
    keyword: string,
    options: SearchOptions = {}
  ): Promise<ApiResponse<SearchResponse>> {
    const cacheKey = CacheManager.generateSearchKey(
      keyword,
      options as Record<string, unknown>
    );
    const cached =
      cacheManager.getMetadata<ApiResponse<SearchResponse>>(cacheKey);

    if (cached) {
      logger.debug(`Search cache hit for keyword: ${keyword}`);
      return cached;
    }

    try {
      await globalRateLimiter.waitForRateLimit();

      logger.info(`Searching novels with keyword: ${keyword}`);

      const params: Record<string, string | number> = {
        out: 'json',
        word: keyword,
        order: options.order || 'new',
        lim: options.limit || 20,
        of: options.fields || 't-w-s-bg-g-k-gf-gl-nt-e-ga-l-f-a-gp-dp-wp-mp',
      };

      // Add all optional parameters
      if (options.start) params['st'] = options.start;
      if (options.gzip) params['gzip'] = options.gzip;
      if (options.notword) params['notword'] = options.notword;
      if (options.title) params['title'] = options.title;
      if (options.ex) params['ex'] = options.ex;
      if (options.keyword) params['keyword'] = options.keyword;
      if (options.wname) params['wname'] = options.wname;
      if (options.biggenre) params['biggenre'] = options.biggenre;
      if (options.genre) params['genre'] = options.genre;
      if (options.notbiggenre) params['notbiggenre'] = options.notbiggenre;
      if (options.notgenre) params['notgenre'] = options.notgenre;
      if (options.userid) params['userid'] = options.userid;
      if (options.isr15) params['isr15'] = options.isr15;
      if (options.isbl) params['isbl'] = options.isbl;
      if (options.isgl) params['isgl'] = options.isgl;
      if (options.iszankoku) params['iszankoku'] = options.iszankoku;
      if (options.istensei) params['istensei'] = options.istensei;
      if (options.istenni) params['istenni'] = options.istenni;
      if (options.istt) params['istt'] = options.istt;
      if (options.notr15) params['notr15'] = options.notr15;
      if (options.notbl) params['notbl'] = options.notbl;
      if (options.notgl) params['notgl'] = options.notgl;
      if (options.notzankoku) params['notzankoku'] = options.notzankoku;
      if (options.nottensei) params['nottensei'] = options.nottensei;
      if (options.nottenni) params['nottenni'] = options.nottenni;
      if (options.minlen) params['minlen'] = options.minlen;
      if (options.maxlen) params['maxlen'] = options.maxlen;
      if (options.length) params['length'] = options.length;
      if (options.mintime) params['mintime'] = options.mintime;
      if (options.maxtime) params['maxtime'] = options.maxtime;
      if (options.time) params['time'] = options.time;
      if (options.kaiwaritu) params['kaiwaritu'] = options.kaiwaritu;
      if (options.sasie) params['sasie'] = options.sasie;
      if (options.type) params['type'] = options.type;
      if (options.buntai) params['buntai'] = options.buntai;
      if (options.stop) params['stop'] = options.stop;
      if (options.lastup) params['lastup'] = options.lastup;
      if (options.lastupdate) params['lastupdate'] = options.lastupdate;
      if (options.ispickup) params['ispickup'] = options.ispickup;
      if (options.opt) params['opt'] = options.opt;

      const response: AxiosResponse = await axios.get(this.apiBaseUrl, {
        params,
        timeout: syosetuConfig.requestTimeout,
      });

      if (response.data && response.data.length > 1) {
        const novels = response.data.slice(1);

        const result: ApiResponse<SearchResponse> = {
          success: true,
          data: {
            keyword,
            totalFound: response.data[0].allcount,
            results: novels.map((novel: any) => ({
              ncode: novel.ncode,
              title: novel.title,
              author: novel.writer,
              summary: novel.story,
              biggenre: novel.biggenre,
              genre: novel.genre,
              keywords: novel.keyword,
              firstPublished: novel.general_firstup,
              lastUpdated: novel.general_lastup,
              novelType: novel.noveltype,
              isCompleted: novel.end === 0,
              totalChapters: novel.general_all_no,
              wordCount: novel.length,
              bookmarks: novel.fav_novel_cnt,
              points: novel.all_point,
              globalPoints: novel.global_point,
              dailyPoints: novel.daily_point,
              weeklyPoints: novel.weekly_point,
              monthlyPoints: novel.monthly_point,
              weeklyUnique: novel.weekly_unique,
            })),
          },
          timestamp: new Date().toISOString(),
        };

        cacheManager.setMetadata(cacheKey, result);
        logger.info(`Search completed successfully for keyword: ${keyword}`);
        return result;
      } else {
        const result: ApiResponse<SearchResponse> = {
          success: true,
          data: {
            keyword,
            totalFound: 0,
            results: [],
          },
          timestamp: new Date().toISOString(),
        };
        return result;
      }
    } catch (error) {
      logger.error(`Error searching novels with keyword ${keyword}:`, error);
      return {
        success: false,
        error: `Lỗi khi tìm kiếm: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getRanking(
    options: RankingOptions = {}
  ): Promise<ApiResponse<RankingResponse>> {
    const cacheKey = CacheManager.generateRankingKey(
      options as Record<string, unknown>
    );
    const cached =
      cacheManager.getMetadata<ApiResponse<RankingResponse>>(cacheKey);

    if (cached) {
      logger.debug('Ranking cache hit');
      return cached;
    }

    try {
      await globalRateLimiter.waitForRateLimit();

      logger.info('Fetching ranking');

      const params: Record<string, string | number> = {
        out: 'json',
        order: options.order || 'hyoka',
        lim: options.limit || 50,
        of: 't-w-s-bg-g-f-a-gp',
      };

      if (options.biggenre) params['biggenre'] = options.biggenre;
      if (options.genre) params['genre'] = options.genre;

      const response: AxiosResponse = await axios.get(this.apiBaseUrl, {
        params,
        timeout: syosetuConfig.requestTimeout,
      });

      if (response.data && response.data.length > 1) {
        const novels = response.data.slice(1);

        const result: ApiResponse<RankingResponse> = {
          success: true,
          data: {
            rankings: novels.map((novel: any, index: number) => ({
              rank: index + 1,
              ncode: novel.ncode,
              title: novel.title,
              author: novel.writer,
              summary: novel.story,
              genre: novel.genre,
              bookmarks: novel.fav_novel_cnt,
              points: novel.all_point,
              globalPoints: novel.global_point,
            })),
          },
          timestamp: new Date().toISOString(),
        };

        cacheManager.setMetadata(cacheKey, result);
        logger.info('Ranking fetched successfully');
        return result;
      } else {
        const result: ApiResponse<RankingResponse> = {
          success: true,
          data: { rankings: [] },
          timestamp: new Date().toISOString(),
        };
        return result;
      }
    } catch (error) {
      logger.error('Error fetching ranking:', error);
      return {
        success: false,
        error: `Lỗi khi lấy ranking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const syosetuService = new SyosetuService();
