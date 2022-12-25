import "module-alias/register";
import process from "process";
import type { WebClient } from "@slack/client";
import logger from "@common/logSender";
import { loadConfig } from "@common/utils/config";
import { MSG_TYPE } from "@common/constants";
import controller from "./controller";
import { database } from "./database";

loadConfig();

class WorkerProcess {
  web: WebClient | undefined = undefined;

  constructor() {}

  initMessageListener() {
    process.on("message", ({ data, type }) => {
      const message = data?.message;

      if (!message) {
        return;
      }

      switch (type) {
        case MSG_TYPE.TOKEN:
          this.web = controller.token(message.token);
          break;
        // case MSG_TYPE.TALK:
        //   controller.talk(this.web, message);
        //   break;
        case MSG_TYPE.COOKIE_REACTION:
          controller.cookieAddReaction(message);
          break;
        case MSG_TYPE.COOKIE_MESSAGE:
          if (this.web) {
            controller.cookieMessage(this.web, message);
          } else {
            logger.error(
              `[MSG_TYPE.COOKIE_MESSAGE] worker web client not exist`
            );
          }
          break;
        default:
          break;
      }
    });
  }

  async bootstrap() {
    this.initMessageListener();
    await logger.init();
    await database.init();
  }
}

const worker = new WorkerProcess();

worker
  .bootstrap()
  .then(() => {
    logger.debug("worker bootstrap success !!!");
  })
  .catch((e) => {
    logger.error(`worker bootstrap error : ${e}`);
  });
