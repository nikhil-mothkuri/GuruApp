import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } },
  }),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.refreshToken',
      'req.body.idToken',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
});
