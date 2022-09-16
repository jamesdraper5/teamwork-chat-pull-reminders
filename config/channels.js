const bravoTeamMembers = [
  "jamesdraper5",
  "atilkan",
  "sanjay-bhuva",
  "wandarkaf",
  "IvayloEntropy",
  "PeterLazarov",
  "Michal-Dziedzinski",
  "luketynan",
];

/*
available opts:
  - filterFn: A custom filter function to filter the PRs, e.g. by draft only: `(pr) => pr.node.isDraft` - the available nodes can been seen in the query in github.js
  - message: A custom message at the start of your notification that describes what PRs are listed, e.g. "Here are all the draft PRs"
*/
module.exports = [
  {
    name: "Bravo Team",
    url: "https://chat-hooks.us.teamwork.com/v1/in/1/2663f77d-9477-4a10-a868-2c5ee06661a7",
    repos: ["teamwork-lightspeed", "teamwork-web-app"],
    opts: {
      filterFn: function (pr) {
        return (
          !pr.node.isDraft &&
          pr.node.reviews.nodes.length === 0 &&
          pr.node.comments.nodes.length === 0 &&
          bravoTeamMembers.includes(pr.node.author.login)
        );
      },
    },
  },
];
