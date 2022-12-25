import "module-alias/register";
import pm2, { ProcessDescription } from "pm2";
import process from "process";
import logger from "@common/logSender";
import { PROCESS_NAME, MSG_TYPE } from "@common/constants";
import { loadConfig } from "@common/utils/config";

loadConfig();

const WORKER_COUNT = parseInt(process.env.WORKER_COUNT, 10) || 0;

class MasterProcess {
  robot: any = undefined;
  workers: ProcessDescription[] = [];
  roundRobinIdx = 0;

  constructor(robot) {
    this.robot = robot;
  }

  createLogger() {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      pm2.start(
        {
          name: PROCESS_NAME.LOGGER,
          script: "scripts/logger/index.js",
          exec_mode: "cluster",
          instances: 1,
          out_file: "/dev/null",
          error_file: "/dev/null",
        },
        (err) => {
          if (err) {
            reject(`logger start error!`);
            return;
          }

          logger.init();
          resolve("logger");
        }
      );
    });
  }

  createWorker() {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      pm2.start(
        {
          name: PROCESS_NAME.WORKER,
          script: "scripts/worker/index.js",
          exec_mode: "cluster",
          instances: WORKER_COUNT,
          out_file: "/dev/null",
          error_file: "/dev/null",
        },
        (err) => {
          if (err) {
            reject(`worker start error!`);
            return;
          }

          resolve("worker");
        }
      );
    });
  }

  killAllProcess() {
    pm2.killDaemon((err) => {
      if (err) {
        logger.error(`process kill fail : ${err}`);
        return;
      }

      process.exit();
    });
  }

  sendMessageToWorker(message, type) {
    if (!this.workers.length) {
      logger.error(`there is no worker to send message`);
      return;
    }

    this.roundRobinIdx += 1;
    if (this.roundRobinIdx >= this.workers.length) {
      this.roundRobinIdx = 0;
    }
    const targetWorker = this.workers[this.roundRobinIdx];

    if (targetWorker) {
      const workerPID = targetWorker.pm_id as number;

      pm2.sendDataToProcessId(
        workerPID,
        {
          type,
          topic: "slack",
          data: {
            message,
          },
        },
        (err) => {
          if (err) {
            logger.error(`sending message to worker error : ${err}`);
          }
        }
      );
    } else {
      logger.error(`target worker not exist`);
    }
  }

  initWorkers() {
    return new Promise((resolve, reject) => {
      pm2.list((err, list) => {
        if (err) {
          reject(`get process list error : ${err}`);
          return;
        }

        this.workers = list.filter((process) => {
          return process.name === PROCESS_NAME.WORKER;
        });

        const workerLength = this.workers.length;
        if (workerLength < 1 || workerLength !== WORKER_COUNT) {
          reject(
            `workers load error [workers.length : ${workerLength}], [WORKER_COUNT: ${WORKER_COUNT}]`
          );
          return;
        }

        this.workers.forEach((worker) => {
          pm2.sendDataToProcessId(
            worker.pm_id as number,
            {
              type: MSG_TYPE.TOKEN,
              topic: "slack",
              data: {
                message: {
                  token: this.robot.adapter.options.token,
                },
              },
            },
            (err) => {
              if (err) {
                logger.error(`sending token message to worker error : ${err}`);
              }
            }
          );
        });

        resolve("token");
      });
    });
  }

  initRobotListener() {
    this.robot.hear(/(.*):cookie:(.*)/i, (res) => {
      //logger.debug(`cookie message : ${JSON.stringify(res.message)}`);
      this.sendMessageToWorker(res.message, MSG_TYPE.COOKIE_MESSAGE);
    });

    this.robot.hearReaction(async (res) => {
      if (res.message.type === "added" && res.message.reaction === "cookie") {
        this.sendMessageToWorker(res.message, MSG_TYPE.COOKIE_REACTION);
      }
    });

    // this.robot.hear(/:talk:/, (res) => {
    //   logger.debug(`talk message : ${JSON.stringify(res.message)}`);
    //   this.sendMessageToWorker(res.message, MSG_TYPE.TALK);
    // });
  }

  async bootstrap() {
    await this.createLogger();
    await this.createWorker();
    await this.initWorkers();
    this.initRobotListener();
  }
}

module.exports = (robot) => {
  const masterProcess = new MasterProcess(robot);

  masterProcess
    .bootstrap()
    .then(() => {
      logger.debug("master bootstrap success !!!");
    })
    .catch((e) => {
      logger.error(`master bootstrap error : ${e}`);
    });

  process.on("SIGINT", () => {
    masterProcess.killAllProcess();
  });
};
