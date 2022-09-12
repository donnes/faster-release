const {
  JIRA_PATTERN,
  GITHUB_PR_PATTERN,
  NUMBER_PATTERN,
} = require('./constants')

const renderGithubPullRequestLink = (pullRequestLink = '', title = '') => {
  const commitPullRequest = title.match(GITHUB_PR_PATTERN)?.[0] || null
  if (!commitPullRequest) return title

  const pullRequestNumber = commitPullRequest.match(NUMBER_PATTERN)?.[0] || null
  if (!pullRequestNumber) return title

  return title.replace(
    GITHUB_PR_PATTERN,
    `[${commitPullRequest}](${pullRequestLink}/${pullRequestNumber})`
  )
}

const renderJiraLink = (jiraLink = '', title = '') => {
  return title.replace(JIRA_PATTERN, `[$1](${jiraLink}$1)`)
}

function getCommitMessageAsTitle(message = '') {
  const titleArr = message.split('\n')
  return titleArr.length ? titleArr[0] : commit.message
}

module.exports = {
  renderGithubPullRequestLink,
  renderJiraLink,
  getCommitMessageAsTitle,
}
