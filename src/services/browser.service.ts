import puppeteer, { Browser, Page } from 'puppeteer';
import { puppeteerConfig, syosetuConfig } from '@/config';
import { createChildLogger } from '@/utils';

const logger = createChildLogger('BrowserService');

export class BrowserService {
  private browser: Browser | null = null;
  private isInitializing = false;

  async initBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.browser && this.browser.connected) {
        return this.browser;
      }
    }

    this.isInitializing = true;

    try {
      logger.info('Initializing browser...');

      const launchOptions = {
        ...puppeteerConfig.launchOptions,
        headless: true,
        ...(puppeteerConfig.executablePath && {
          executablePath: puppeteerConfig.executablePath,
        }),
      };

      this.browser = await puppeteer.launch(launchOptions);

      logger.info('Browser initialized successfully');

      // Handle browser disconnect
      this.browser.on('disconnected', () => {
        logger.warn('Browser disconnected');
        this.browser = null;
      });

      return this.browser;
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw new Error(
        `Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      this.isInitializing = false;
    }
  }

  async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(syosetuConfig.userAgent);

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set request timeout
    page.setDefaultTimeout(syosetuConfig.requestTimeout);

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', request => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        void request.abort();
      } else {
        void request.continue();
      }
    });

    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        logger.info('Browser closed successfully');
      } catch (error) {
        logger.error('Error closing browser:', error);
      } finally {
        this.browser = null;
      }
    }
  }

  async isConnected(): Promise<boolean> {
    return this.browser?.connected ?? false;
  }

  async getVersion(): Promise<string> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    return this.browser.version();
  }
}

export const browserService = new BrowserService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing browser...');
  await browserService.closeBrowser();
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing browser...');
  await browserService.closeBrowser();
});
