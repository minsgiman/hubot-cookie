import type { WebClient } from "@slack/client";
import logger from "@common/logSender";
import { saveCookieMessage } from "@worker/database";

function sendCookieMessage({
  web,
  senderId,
  receiverIds,
  messagePermalLink,
  replyMsg,
}) {
  const receiverIdsString = receiverIds.reduce(
    (acc, id) => (acc += `<@${id}> `),
    ""
  );
  const attachments = [
    {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${messagePermalLink}|Message>*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${replyMsg.text}`,
          },
        },
      ],
    },
  ];

  web.chat.postMessage({
    channel: senderId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${receiverIdsString}님께 :cookie:를 선물했습니다.\n`,
        },
      },
    ],
    attachments,
    as_user: true,
  });

  receiverIds.forEach((userId) => {
    web.chat.postMessage({
      channel: userId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${replyMsg.user}> 님께서 보낸 :cookie: 선물이 도착했습니다!!`,
          },
        },
      ],
      attachments,
      as_user: true,
    });
  });
}

async function handleCookieMessage(web: WebClient, message) {
  const replies = await web.conversations.replies({
    channel: message.room,
    ts: message.id,
  });
  const replyMsg = replies?.messages?.[0];
  const elements = replyMsg.blocks[0]?.elements[0]?.elements;

  if (!replyMsg || !elements) {
    logger.error("replyMsg or elements not exist");
    return;
  }

  const receiverIds = elements
    .filter((element) => element.type === "user")
    .map((element) => element.user_id);

  if (!receiverIds.length) {
    return;
  }

  const uniqueReceiverIds = [...new Set(receiverIds)] as string[];
  const cookieCount = elements.filter(
    (element) => element.type === "emoji" && element.name === "cookie"
  ).length;

  const { permalink: messagePermalLink } = await web.chat.getPermalink({
    channel: message.room,
    message_ts: message.id,
  });

  sendCookieMessage({
    web,
    senderId: replyMsg.user,
    receiverIds: uniqueReceiverIds,
    messagePermalLink,
    replyMsg,
  });

  saveCookieMessage({
    senderId: replyMsg.user,
    receiverIds: uniqueReceiverIds,
    channelId: message.room,
    threadId: message.thread_ts || message.id,
    messageId: message.id,
    cookieCount,
    message: replyMsg.text,
    timestamp: replyMsg.ts,
  });
}

export default handleCookieMessage;
