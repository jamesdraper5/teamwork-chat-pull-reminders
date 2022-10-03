"use strict";

const moment = require("moment");
const getStalePRs = require("./lib/github");
const sendMessage = require("./lib/sendMessage");
const channels = require("./config/channels");

const reviewDecisionMap = {
  APPROVED: ":white_check_mark: Approved",
  REVIEW_REQUIRED: ":thinking_face: Needs review",
  CHANGES_REQUESTED: ":x: Changes requested",
};

async function getMessageText(stalePRs) {
  const formattedPRs = stalePRs.map(formatPR);
  //console.log("formattedPRs", formattedPRs);
  let messageText = `${getMessageTitle(stalePRs.length)} \n\n`;
  messageText += "| Repository | PR | Author | Status | Date Created | \n";
  messageText += "----- | ----- | ----- | ----- | ----- | \n";
  messageText += `${formattedPRs.join("\n")}`;
  //console.log("messageText", messageText);
  return messageText;
}

function getMessageTitle(prCount) {
  if (prCount === 1) {
    return `There is ${prCount} PR open:`;
  } else {
    return `There are ${prCount} PRs open:`;
  }
}

function formatPR(pr) {
  return `| ${pr.repo} | [${pr.title}](${pr.url}) | ${pr.author.chatHandle} | ${
    reviewDecisionMap[pr.reviewDecision]
  } | ${getDaysAgo(pr.createdAt)} |`;
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
        let stalePRs = await getStalePRs(channel.repos, channel.opts);
        //console.log("stalePRs", stalePRs);
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
