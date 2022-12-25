import mongoose from "mongoose";

const CookieReactionSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  channelId: String,
  threadId: Number,
  messageId: Number,
  timestamp: Number,
});

export default mongoose.model("cookie-reaction", CookieReactionSchema);
