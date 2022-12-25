import { saveCookieReaction } from "@worker/database";

async function sendCookieAddReaction(message) {
  saveCookieReaction({
    senderId: message.user.id,
    receiverId: message.item_user.id,
    channelId: message.room,
    messageId: message.item.ts,
    timestamp: message.event_ts,
  });
}

export default sendCookieAddReaction;
