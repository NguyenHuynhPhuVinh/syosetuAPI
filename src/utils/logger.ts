import pino from 'pino';
import { appConfig } from '@/config';

export const logger = pino(
  appConfig.logger.prettyPrint
    ? {
        level: appConfig.logger.level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
            sync: true,
          },
        },
      }
    : {
        level: appConfig.logger.level,
      }
);

export const createChildLogger = (context: string): pino.Logger => {
  return logger.child({ context });
};
