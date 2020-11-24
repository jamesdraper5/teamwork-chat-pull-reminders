/*
available opts:
  - filterFn: A custom filter function to filter the PRs, e.g. by draft only: `(pr) => pr.node.isDraft` - the available nodes can been seen in the query in github.js
  - message: A custom message at the start of your notification that describes what PRs are listed, e.g. "Here are all the draft PRs"
*/
module.exports = [
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