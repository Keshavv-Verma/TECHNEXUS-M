const config = require('../config');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const configuredLevel = LEVELS[config.logging.level] ?? LEVELS.info;

const shouldLog = (level) => LEVELS[level] <= configuredLevel;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  return `${base} ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
};

const logger = {
  error(message, meta) {
    if (shouldLog('error')) console.error(formatMessage('error', message, meta));
  },
  warn(message, meta) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  info(message, meta) {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  debug(message, meta) {
    if (config.isDevelopment && shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
