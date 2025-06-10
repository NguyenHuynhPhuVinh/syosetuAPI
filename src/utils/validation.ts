import { z } from 'zod';

export const validateNcode = (ncode: string): boolean => {
  return /^[a-z0-9]+$/i.test(ncode);
};

export const validateChapterNumber = (chapter: string): number | null => {
  const chapterNumber = parseInt(chapter, 10);
  if (isNaN(chapterNumber) || chapterNumber < 1) {
    return null;
  }
  return chapterNumber;
};

export const validateSearchOrder = (order: string): boolean => {
  const validOrders = [
    'new',
    'favnovelcnt',
    'reviewcnt',
    'hyoka',
    'hyokaasc',
    'dailypoint',
    'weeklypoint',
    'monthlypoint',
    'quarterpoint',
    'yearlypoint',
    'impressioncnt',
    'hyokacnt',
    'hyokacntasc',
    'weekly',
    'lengthdesc',
    'lengthasc',
    'generalfirstup',
    'ncodeasc',
    'ncodedesc',
    'old',
  ];
  return validOrders.includes(order);
};

export const validateRankingOrder = (order: string): boolean => {
  const validOrders = [
    'hyoka',
    'favnovelcnt',
    'reviewcnt',
    'dailypoint',
    'weeklypoint',
    'monthlypoint',
    'quarterpoint',
    'yearlypoint',
  ];
  return validOrders.includes(order);
};

export const validateLimit = (limit: number, max: number = 500): boolean => {
  return limit >= 1 && limit <= max;
};

export const validateStartPosition = (start: number): boolean => {
  return start >= 1 && start <= 2000;
};

export const validateGzipLevel = (gzip: number): boolean => {
  return gzip >= 1 && gzip <= 5;
};

// Zod schemas for request validation
export const ncodeParamsSchema = z.object({
  ncode: z.string().regex(/^[a-z0-9]+$/i, 'Ncode không hợp lệ'),
});

export const chapterParamsSchema = z.object({
  ncode: z.string().regex(/^[a-z0-9]+$/i, 'Ncode không hợp lệ'),
  chapter: z.string().regex(/^\d+$/, 'Chapter phải là số nguyên dương'),
});

export const multipleChaptersBodySchema = z.object({
  chapters: z.array(z.number().int().positive()).min(1).max(10),
});

export const searchQuerySchema = z.object({
  keyword: z.string().min(1, 'Keyword là bắt buộc'),
  order: z.string().optional(),
  limit: z.string().optional(),
  start: z.string().optional(),
  gzip: z.string().optional(),
  fields: z.string().optional(),
  notword: z.string().optional(),
  title: z.string().optional(),
  ex: z.string().optional(),
  wname: z.string().optional(),
  biggenre: z.string().optional(),
  genre: z.string().optional(),
  notbiggenre: z.string().optional(),
  notgenre: z.string().optional(),
  userid: z.string().optional(),
  isr15: z.string().optional(),
  isbl: z.string().optional(),
  isgl: z.string().optional(),
  iszankoku: z.string().optional(),
  istensei: z.string().optional(),
  istenni: z.string().optional(),
  istt: z.string().optional(),
  notr15: z.string().optional(),
  notbl: z.string().optional(),
  notgl: z.string().optional(),
  notzankoku: z.string().optional(),
  nottensei: z.string().optional(),
  nottenni: z.string().optional(),
  minlen: z.string().optional(),
  maxlen: z.string().optional(),
  length: z.string().optional(),
  mintime: z.string().optional(),
  maxtime: z.string().optional(),
  time: z.string().optional(),
  kaiwaritu: z.string().optional(),
  sasie: z.string().optional(),
  type: z.string().optional(),
  buntai: z.string().optional(),
  stop: z.string().optional(),
  lastup: z.string().optional(),
  lastupdate: z.string().optional(),
  ispickup: z.string().optional(),
  opt: z.string().optional(),
});

export const rankingQuerySchema = z.object({
  order: z.string().optional(),
  biggenre: z.string().optional(),
  genre: z.string().optional(),
  limit: z.string().optional(),
});
