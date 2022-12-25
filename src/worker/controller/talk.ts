import logger from "@common/logSender";

function getUnixTime(timestamp) {
  return Math.floor(timestamp / 1000);
}

function getThisMonthOldestUnixTime() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return {
    ts: getUnixTime(date.getTime()),
    month: date.getMonth() + 1,
  };
}

function getMostReactionMessage(messages) {
  let mostReply;
  let mostReaction;

  const sumReactionsCount = (reactions) => {
    if (!reactions) {
      return 0;
    }

    return reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  };

  messages?.forEach((message) => {
    if (!message) {
      return;
    }

    if (mostReply) {
      if ((mostReply.reply_count ?? 0) < (message.reply_count ?? 0)) {
        mostReply = message;
      }
    } else {
      mostReply = message;
    }

    if (mostReaction) {
      if (
        sumReactionsCount(mostReaction.reactions) <
        sumReactionsCount(message.reactions)
      ) {
        mostReaction = message;
      }
    } else {
      mostReaction = message;
    }
  });

  return {
    mostReply,
    mostReaction,
  };
}

async function sendMostReactionLink(web, message) {
  if (!web) {
    return;
  }

  const oldestTime = getThisMonthOldestUnixTime();
  const conversationHistory = await web.conversations.history({
    channel: message.room,
    oldest: oldestTime.ts,
  });

  logger.debug(`history : ${JSON.stringify(conversationHistory)}`);

  const { mostReply, mostReaction } = getMostReactionMessage(
    conversationHistory.messages
  );
  const mostReplyLink = await web.chat.getPermalink({
    channel: message.room,
    message_ts: mostReply.ts,
  });
  const mostReactionLink = await web.chat.getPermalink({
    channel: message.room,
    message_ts: mostReaction.ts,
  });

  web.chat.postMessage({
    channel: message.room,
    text: `${oldestTime.month}월의 Topic \n* 가장 많은 리액션 : ${mostReactionLink.permalink}\n* 가장 활발한 논의 : ${mostReplyLink.permalink}`,
    as_user: true,
  });
}

export default sendMostReactionLink;
