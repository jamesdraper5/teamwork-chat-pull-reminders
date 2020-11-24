'use strict';

const moment = require('moment');
const getStalePRs = require('./lib/github');
const sendMessage = require('./lib/sendMessage');
const channels = require('./config/channels');

async function getMessageText(repos, opts = {}) {
  const stalePRs = await getStalePRs(repos, opts);
  console.log("stalePRs", stalePRs);
  const formattedPRs = stalePRs.map(formatPR);
  console.log("formattedPRs", formattedPRs);
  let messageText = opts.message || `There are ${stalePRs.length} PRs with no reviews or comments:`;
  messageText += `\n- ${formattedPRs.join("\n-")}`;
  console.log("messageText", messageText);
  return messageText;
}

function formatPR(pr) {
  return `[${pr.repo}] - [${pr.title}](${pr.url}) - ${pr.author} (${getDaysAgo(pr.createdAt)})`;
}

function getDaysAgo(date) {
  const daysOld = moment().startOf('day').diff(moment(date).startOf('day'), "days");
  if (daysOld === 1) {
    return `${daysOld} day old`;
  }
  if (daysOld === 0) {
    return 'Created Today'
  }
  return `${daysOld} days old`;
}

module.exports.sendUpdate = async event => {
  try {
    await Promise.all(
      channels.map(async channel => {
        const messageText = await getMessageText(channel.repos, channel.opts);
        console.log('messageText', messageText);
        await sendMessage(messageText, channel.url);
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Error',
          error: e
        },
        null,
        2
      ),
    };
  }
};
