const bravoTeamMembers = [
  {
    githubHandle: "jamesdraper5",
    chatHandle: "@james",
  },
  {
    githubHandle: "atilkan",
    chatHandle: "@emrah",
  },
  {
    githubHandle: "sanjay-bhuva",
    chatHandle: "@sanjay",
  },
  {
    githubHandle: "wandarkaf",
    chatHandle: "@alonso",
  },
  {
    githubHandle: "IvayloEntropy",
    chatHandle: "@ivaylo",
  },
  {
    githubHandle: "barry-mckay",
    chatHandle: "@barry",
  },
];

const bravoTeamGithubHandles = bravoTeamMembers.map(
  (member) => member.githubHandle
);

function getDiffInDays(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getDaysSinceToday(date) {
  console.log("getDaysSinceToday", date);

  return getDiffInDays(date, new Date());
}

/*
available opts:
  - filterFn: A custom filter function to filter the PRs, e.g. by draft only: `(pr) => pr.node.isDraft` - the available nodes can been seen in the query in github.js
  - message: A custom message at the start of your notification that describes what PRs are listed, e.g. "Here are all the draft PRs"
*/
module.exports = [
  {
    name: "Bravo Team",
    url: "https://chat-hooks.us.teamwork.com/v1/in/1/a0cde569-809e-4e7c-9abc-33647ab4eeb4",
    repos: ["teamwork-lightspeed", "teamwork-web-app"],
    opts: {
      filterFn: function (pr) {
        return (
          !pr.node.isDraft &&
          bravoTeamGithubHandles.includes(pr.node.author.login)
        );
      },
      teamMembers: bravoTeamMembers,
    },
  },
];
