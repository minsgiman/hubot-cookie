import dotenv from "dotenv";
import path from "path";
import process from "process";

export function loadConfig() {
  dotenv.config({
    path: path.resolve(
      process.cwd(),
      `.env.${process.env.NODE_ENV || "development"}`
    ),
  });
}
