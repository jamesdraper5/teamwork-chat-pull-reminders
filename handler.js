'use strict';

const moment = require('moment');
const getStalePRs = require('./lib/github');
const sendMessage = require('./lib/sendMessage');

const channelUrl = process.env.CHANNEL_URL;

async function getMessageText() {
  const stalePRs = await getStalePRs();
  console.log("stalePRs", stalePRs);
  const formattedPRs = stalePRs.map(formatPR);
  console.log("formattedPRs", formattedPRs);
  let messageText = '- '
  messageText += formattedPRs.join('\n-');
  console.log('messageText 1', messageText)
  return messageText;
}

function formatPR(pr) {
  return `[${pr.repo}] - [${pr.title}](${pr.url}) - ${getDaysAgo(
    pr.createdAt
  )}`;
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
    const messageText = await getMessageText();
    console.log('messageText', messageText)
    await sendMessage(messageText, channelUrl);
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
