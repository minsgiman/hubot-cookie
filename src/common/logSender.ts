import pm2 from "pm2";
import process from "process";
import { LOG_LEVEL, PROCESS_NAME, MSG_TYPE } from "./constants";
import { getProcessId } from "./utils/getProcessId";

class LogSender {
  loggerProcessId: number | undefined = undefined;

  constructor() {}

  async init() {
    const processId = await getProcessId(PROCESS_NAME.LOGGER);
    this.loggerProcessId = processId;
    return processId;
  }

  sendLog(type, log) {
    if (this.loggerProcessId === undefined) {
      console.log(log);
      return;
    }

    pm2.sendDataToProcessId(
      this.loggerProcessId,
      {
        type: MSG_TYPE.LOG,
        pid: process.pid,
        topic: "log",
        data: {
          message: {
            type,
            log,
          },
        },
      },
      (err) => {
        if (err) {
          console.error(`sending message to logger error : ${err}`);
        }
      }
    );
  }

  debug(log) {
    this.sendLog(LOG_LEVEL.DEBUG, log);
  }

  info(log) {
    this.sendLog(LOG_LEVEL.INFO, log);
  }

  warning(log) {
    this.sendLog(LOG_LEVEL.WARNING, log);
  }

  error(log) {
    this.sendLog(LOG_LEVEL.ERROR, log);
  }
}

export default new LogSender();
