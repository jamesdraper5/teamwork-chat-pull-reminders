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
        console.log("-------- Title ---------", pr.node.title);

        console.log("Created At", pr.node.createdAt);

        console.log(
          "pr.node.reviews.nodes.length",
          pr.node.reviews.nodes.length
        );
        console.log(
          "pr.node.comments.nodes.length ",
          pr.node.comments.nodes.length
        );
        console.log("pr.node.author.login", pr.node.author.login);

        return (
          !pr.node.isDraft &&
          pr.node.reviews.nodes.length === 0 &&
          (pr.node.comments.nodes.length === 0 ||
            (pr.node.comments.nodes.length === 1 &&
              pr.node.comments.nodes[0].author === "changeset-bot")) &&
          bravoTeamMembers.includes(pr.node.author.login)
        );
      },
    },
  },
];
