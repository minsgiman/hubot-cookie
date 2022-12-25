import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import process from "process";

class Logger {
  logger: any = undefined;

  constructor() {}

  pad(num, maxLength) {
    const numStr = num.toString();
    return numStr.padStart(maxLength, "0");
  }

  init() {
    const { combine, timestamp, printf } = winston.format;
    const logDir = `${process.cwd()}/logs`;
    const logFormat = printf(({ level, message, timestamp }) => {
      return `[${timestamp} ${level}] ${message}`;
    });

    this.logger = winston.createLogger({
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),

      transports: [
        new winstonDaily({
          level: "debug",
          datePattern: "YYYY-MM-DD",
          dirname: logDir,
          filename: `%DATE%.log`,
          maxFiles: 30,
          maxSize: 1 * 1024 * 1024 * 1024,
          zippedArchive: true,
        }),
      ],
    });
  }

  debug(msg) {
    this.logger?.debug(msg);
  }

  info(msg) {
    this.logger?.info(msg);
  }

  warning(msg) {
    this.logger?.warn(msg);
  }

  error(msg) {
    this.logger?.error(msg);
  }
}

export default new Logger();
