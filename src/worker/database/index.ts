import mongoose from "mongoose";
import process from "process";
import cookieMessageModel from "./model/cookieMessage";
import cookieReactionModel from "./model/cookieReaction";

class Database {
  constructor() {}

  init() {
    return new Promise((resolve, reject) => {
      mongoose.connection.on("error", (err) => {
        reject(`MongoDB connection error: ${err}`);
      });
      mongoose.connection.on("connected", () => {
        resolve(`Mongoose connection open`);
      });
      mongoose.connect(
        process.env.MONGODB_URL,
        {
          dbName: "cookie",
        },
        () => {}
      );
      mongoose.Promise = global.Promise;
    });
  }
}

export const database = new Database();

export function saveCookieMessage(data) {
  cookieMessageModel.create(data);
}

export function saveCookieReaction(data) {
  cookieReactionModel.create(data);
}
