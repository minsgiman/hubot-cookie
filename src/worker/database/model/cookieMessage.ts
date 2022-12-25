import mongoose from "mongoose";

const CookieMessageSchema = new mongoose.Schema({
  senderId: String,
  receiverIds: [String],
  channelId: String,
  threadId: Number,
  messageId: Number,
  cookieCount: Number,
  message: String,
  timestamp: Number,
});

export default mongoose.model("cookie-message", CookieMessageSchema);
