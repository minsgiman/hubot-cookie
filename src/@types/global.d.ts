export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WORKER_COUNT: string;
      MONGODB_URL: string;
      NODE_ENV?: "production" | "development";
    }
  }
}
