'use strict';

const moment = require('moment');
const getStalePRs = require('./lib/github');
const sendMessage = require('./lib/sendMessage');

/*
available opts:
  - filterFn: A custom filter function to filter the PRs, e.g. by draft only: `(pr) => pr.node.isDraft` - the available nodes can been seen in the query in github.js
  - message: A custom message at the start of your notification that describes what PRs are listed, e.g. "Here are all the draft PRs"
*/
const channels = [
  {
    name: 'Team Echo',
    url: 'https://chat-hooks.us.teamwork.com/v1/in/1/2663f77d-9477-4a10-a868-2c5ee06661a7',
    repos: [
      'project-manager',
      'projects-web-app'
    ],
    opts: {
      message: 'Test custom message: these are draft PRS:',
      filterFn: (pr) => pr.node.isDraft
    }
  },
  {
    name: 'Team Echo',
    url: 'https://chat-hooks.us.teamwork.com/v1/in/1/2663f77d-9477-4a10-a868-2c5ee06661a7',
    repos: [
      'project-manager',
      'projects-web-app'
    ],
    opts: {}
  }
];

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
