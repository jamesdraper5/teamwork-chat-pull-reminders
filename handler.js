'use strict';

const moment = require('moment');
const getStalePRs = require('./lib/github');
const sendMessage = require('./lib/sendMessage');

const channelUrl = process.env.CHANNEL_URL;
const relevantRepos = process.env.REPO_NAMES.split(',');

const teams = [
  {
    name: 'Echo',
    channelUrl: process.env.CHANNEL_URL,
    repos: relevantRepos,
    opts: {} // you can add a custom `filterFn` here to filter the PRs
  },
  {
    name: 'Reports Channel',
    channelUrl: 'https://chat-hooks.us.teamwork.com/v1/in/1/467af93b-10f2-4338-ae7b-da5abf6ce742',
    repos: [
      'project-manager',
      'projects-web-app'
    ],
    opts: {
      filterFn: (pr) => pr.node.isDraft
    }
  },
  {
    name: 'Custom Fields',
    channelUrl: 'https://chat-hooks.us.teamwork.com/v1/in/1/52ed7609-7161-460f-8745-d4b319e6eec1',
    repos: [
      'projectsapigo'
    ],
    opts: {}
  }
];

async function getMessageText(repos, opts = {}) {
  const stalePRs = await getStalePRs(repos, opts);
  console.log("stalePRs", stalePRs);
  const formattedPRs = stalePRs.map(formatPR);
  console.log("formattedPRs", formattedPRs);
  let messageText = `There are ${stalePRs.length} PRs with no reviews or comments: \n- ${formattedPRs.join("\n-")}`;
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
      teams.map(async team => {
        const messageText = await getMessageText(team.repos, team.opts);
        console.log('messageText', messageText)
        await sendMessage(messageText, channelUrl);
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
