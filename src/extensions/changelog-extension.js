const { JIRA_PATTERN } = require('../utils/constants')
const {
  getCommitMessageAsTitle,
  renderGithubPullRequestLink,
  renderJiraLink,
} = require('../utils/changelog-template')

module.exports = async (toolbox) => {
  const { config, runtime, filesystem } = toolbox
  const { loadConfig } = config
  const { brand } = runtime

  const myConfig = loadConfig(brand, filesystem.cwd())

  const { atlassianOrg, repoOwner, repoName } = myConfig

  const JIRA_LINK = `https://${atlassianOrg}.atlassian.net/browse/`
  const GITHUB_PR_LINK = `https://github.com/${repoOwner}/${repoName}/pull`

  async function conventionalCommitsContents(commits = []) {
    return {}
  }

  async function jiraConventionalContents(commits = []) {
    const ticketCommits = commits.filter((commit) =>
      commit.commit.message.match(JIRA_PATTERN)
    )
    const otherCommits = commits.filter((commit) => {
      const message = commit.commit.message.toLowerCase()
      return !message.match(JIRA_PATTERN) && !message.includes('release')
    })

    const ticketsContent = ticketCommits.map(({ commit }) => {
      const title = getCommitMessageAsTitle(commit.message)
      return `- ${renderJiraLink(
        JIRA_LINK,
        renderGithubPullRequestLink(title)
      )}`
    })

    const othersContent = otherCommits.map(({ commit }) => {
      const title = getCommitMessageAsTitle(commit.message)
      return `- ${renderGithubPullRequestLink(GITHUB_PR_LINK, title)}`
    })

    return {
      ticketsContent,
      othersContent,
    }
  }

  function readPreviousContent() {
    const file = `${filesystem.cwd()}/CHANGELOG.md`

    if (!filesystem.exists(file)) return ''

    const content = filesystem.read(file)

    return content.substring(/## .* Release v/.exec(content).index)
  }

  async function generate(
    version = '1.0.0',
    commits = [],
    commitsType = 'jira-conventional'
  ) {
    const contents =
      commitsType === 'jira-conventional'
        ? await jiraConventionalContents(commits)
        : await conventionalCommitsContents(commits)

    const previousContent = readPreviousContent()

    await toolbox.template.generate({
      template: 'CHANGELOG.md.ejs',
      target: `${filesystem.cwd()}/CHANGELOG.md`,
      props: { version, previousContent, ...contents },
    })
  }

  // attach our tools to the toolbox
  toolbox.changelog = {
    generate,
  }
}
