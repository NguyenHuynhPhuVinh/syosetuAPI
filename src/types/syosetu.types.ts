export interface NovelMetadata {
  ncode: string;
  title: string;
  author: string;
  summary: string;
  biggenre: number;
  genre: number;
  keywords: string;
  firstPublished: string;
  lastUpdated: string;
  novelType: number;
  isCompleted: boolean;
  totalChapters: number;
  wordCount: number;
  readingTime: number;
  bookmarks: number;
  impressions: number;
  reviews: number;
  points: number;
  raters: number;
}

export interface ChapterContent {
  ncode: string;
  chapterNumber: number;
  title: string;
  htmlContent: string;
  textContent: string;
  date: string;
  characterCount: number;
  estimatedReadingTime: number;
  url: string;
}

export interface SearchOptions {
  order?: string;
  limit?: number;
  notword?: string;
  start?: number;
  gzip?: number;
  fields?: string;
  title?: number;
  ex?: number;
  keyword?: number;
  wname?: number;
  biggenre?: string;
  genre?: string;
  notbiggenre?: string;
  notgenre?: string;
  userid?: string;
  isr15?: number;
  isbl?: number;
  isgl?: number;
  iszankoku?: number;
  istensei?: number;
  istenni?: number;
  istt?: number;
  notr15?: number;
  notbl?: number;
  notgl?: number;
  notzankoku?: number;
  nottensei?: number;
  nottenni?: number;
  minlen?: number;
  maxlen?: number;
  length?: string;
  mintime?: number;
  maxtime?: number;
  time?: string;
  kaiwaritu?: string;
  sasie?: string;
  type?: string;
  buntai?: string;
  stop?: number;
  lastup?: string;
  lastupdate?: string;
  ispickup?: number;
  opt?: string;
}

export interface SearchResult {
  ncode: string;
  title: string;
  author: string;
  summary: string;
  biggenre: number;
  genre: number;
  keywords: string;
  firstPublished: string;
  lastUpdated: string;
  novelType: number;
  isCompleted: boolean;
  totalChapters: number;
  wordCount: number;
  bookmarks: number;
  points: number;
  globalPoints: number;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  weeklyUnique: number;
}

export interface SearchResponse {
  keyword: string;
  totalFound: number;
  results: SearchResult[];
}

export interface RankingOptions {
  order?: string;
  limit?: number;
  biggenre?: string;
  genre?: string;
}

export interface RankingItem {
  rank: number;
  ncode: string;
  title: string;
  author: string;
  summary: string;
  genre: number;
  bookmarks: number;
  points: number;
  globalPoints: number;
}

export interface RankingResponse {
  rankings: RankingItem[];
}

export interface NovelParams {
  ncode: string;
}

export interface ChapterParams {
  ncode: string;
  chapter: string;
}

export interface MultipleChaptersRequest {
  chapters: number[];
}

export interface SearchQuery {
  keyword: string;
  order?: string;
  limit?: string;
  start?: string;
  gzip?: string;
  fields?: string;
  notword?: string;
  title?: string;
  ex?: string;
  wname?: string;
  biggenre?: string;
  genre?: string;
  notbiggenre?: string;
  notgenre?: string;
  userid?: string;
  isr15?: string;
  isbl?: string;
  isgl?: string;
  iszankoku?: string;
  istensei?: string;
  istenni?: string;
  istt?: string;
  notr15?: string;
  notbl?: string;
  notgl?: string;
  notzankoku?: string;
  nottensei?: string;
  nottenni?: string;
  minlen?: string;
  maxlen?: string;
  length?: string;
  mintime?: string;
  maxtime?: string;
  time?: string;
  kaiwaritu?: string;
  sasie?: string;
  type?: string;
  buntai?: string;
  stop?: string;
  lastup?: string;
  lastupdate?: string;
  ispickup?: string;
  opt?: string;
}

export interface RankingQuery {
  order?: string;
  biggenre?: string;
  genre?: string;
  limit?: string;
}
