import pm2 from "pm2";

export function getProcessId(processName: string): Promise<number | undefined> {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) {
        reject(err);
        return;
      }

      const targetProcess = list.find((process) => {
        return process.name === processName;
      });

      if (!targetProcess) {
        reject(`find process failed`);
        return;
      }

      resolve(targetProcess.pm_id);
    });
  });
}
