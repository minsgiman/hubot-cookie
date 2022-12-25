import "module-alias/register";
import process from "process";
import logger from "./logger";
import { MSG_TYPE } from "@common/constants";

class LoggerProcess {
  constructor() {}

  initMessageListener() {
    process.on("message", ({ data, type, pid }) => {
      const message = data?.message;

      if (!message) {
        return;
      }

      switch (type) {
        case MSG_TYPE.LOG:
          logger[message.type]?.(`[${pid}] ${message.log}`);
          break;
        default:
          break;
      }
    });
  }

  bootstrap() {
    this.initMessageListener();
    logger.init();
  }
}

const loggerProcess = new LoggerProcess();

try {
  loggerProcess.bootstrap();
  logger.debug(`[${process.pid}] logger bootstrap success !!!`);
} catch (e) {
  logger.error(`logger bootstrap error : ${e}`);
}
