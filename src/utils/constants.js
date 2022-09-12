const JIRA_PATTERN = /([A-Z]{2,5}-[0-9]{1,4})/gi
const GITHUB_PR_PATTERN = /\(#\d+\)/gi
const NUMBER_PATTERN = /\d+/gi

module.exports = {
  JIRA_PATTERN,
  GITHUB_PR_PATTERN,
  NUMBER_PATTERN,
}
