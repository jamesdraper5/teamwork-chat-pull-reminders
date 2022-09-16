const { graphql } = require("@octokit/graphql");

const token = process.env.GITHUB_TOKEN;

const query = `
  query lastIssues($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      name
      pullRequests(last: 20, states: OPEN, orderBy: {field: CREATED_AT, direction: ASC}) {
        edges {
          node {
            id
            isDraft
            state
            title
            url
            reviews(last: 10) {
              nodes {
                body
                comments(last: 10) {
                  nodes {
                    body
                  }
                }
              }
            }
            author {
              login
            }
            createdAt
            number
            comments(last: 10) {
              nodes {
                body
              }
            }
          }
        }
      }
    }
  }`;

async function getRepoData(repo) {
  try {
    const result = await graphql({
      query,
      owner: "Teamwork",
      repo,
      headers: {
        authorization: `token ${token}`,
      },
    });
    console.log("graphql result", result);
    return result.repository;
  } catch (error) {
    console.log("Request failed:", error.request); // { query, variables: {}, headers: { authorization: 'token secret123' } }
    console.log("graphql error", error.message); // Field 'bla' doesn't exist on type 'Something'
    return null;
  }
}

function defaultFilter(pr) {
  return (
    !pr.node.isDraft &&
    pr.node.reviews.nodes.length === 0 &&
    pr.node.comments.nodes.length === 0
  );
}

function getFilteredRepoPRs(repo, filterFn) {
  const PRs = repo.pullRequests.edges;
  console.log("PRs", JSON.stringify(JSON.parse(PRs), null, 4));
  console.log("filterFn", filterFn ? filterFn.toString() : "undefined");

  if (filterFn) return PRs.filter(filterFn);
  const foo = PRs.filter(defaultFilter);
  console.log("foo", foo);
  return foo;
}

async function getStalePRs(repos, opts) {
  let stalePRs = [];
  await Promise.all(
    repos.map(async (repo) => {
      const repoData = await getRepoData(repo);
      console.log("repoData", repoData);
      if (repoData) {
        const rawPRData = getFilteredRepoPRs(repoData, opts.filterFn);
        console.log("rawPRData", rawPRData);
        const refinedPRData = rawPRData.map((pr) => ({
          repo: repo,
          title: pr.node.title,
          author: pr.node.author.login,
          createdAt: pr.node.createdAt,
          number: pr.node.number,
          url: pr.node.url,
        }));
        stalePRs.push.apply(stalePRs, refinedPRData);
      }
    })
  );
  return stalePRs;
}

module.exports = getStalePRs;
