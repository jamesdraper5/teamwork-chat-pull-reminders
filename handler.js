"use strict";

const moment = require("moment");
const getStalePRs = require("./lib/github");
const sendMessage = require("./lib/sendMessage");
const channels = require("./config/channels");

async function getMessageText(stalePRs) {
  const formattedPRs = stalePRs.map(formatPR);
  console.log("formattedPRs", formattedPRs);
  let messageText = `${getMessageTitle(stalePRs.length)} \n\n`;
  messageText += "| Repository | PR | Author | Date Created | \n";
  messageText += "----- | ----- | ----- | ----- | \n";
  messageText += `${formattedPRs.join("\n")}`;
  console.log("messageText", messageText);
  return messageText;
}

function getMessageTitle(prCount) {
  if (prCount === 1) {
    return `There is ${prCount} PR that is more than 3 days old:`;
  } else {
    return `There are ${prCount} PRs that are more than 3 days old:`;
  }
}

function formatPR(pr) {
  return `| ${pr.repo} | [${pr.title}](${pr.url}) | ${pr.author} | ${getDaysAgo(
    pr.createdAt
  )} |`;
}

function getDaysAgo(date) {
  const daysOld = moment()
    .startOf("day")
    .diff(moment(date).startOf("day"), "days");
  if (daysOld === 1) {
    return `${daysOld} day ago`;
  }
  if (daysOld === 0) {
    return "Created Today";
  }
  return `${daysOld} days ago`;
}

module.exports.sendUpdate = async (event) => {
  try {
    await Promise.all(
      channels.map(async (channel) => {
        const stalePRs = await getStalePRs(channel.repos, channel.opts);
        console.log("stalePRs", stalePRs);
        if (stalePRs.length) {
          const messageText = await getMessageText(stalePRs);
          console.log("messageText", messageText);
          await sendMessage(messageText, channel.url);
        }
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Function executed successfully!",
          input: event,
        },
        null,
        2
      ),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          error: e,
        },
        null,
        2
      ),
    };
  }
};
