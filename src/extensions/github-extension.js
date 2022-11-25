const { Octokit } = require('octokit')

/**
 * Github Extension
 * @param {import('gluegun').GluegunToolbox} toolbox
 */
module.exports = (toolbox) => {
  const { config, runtime, filesystem, prompt } = toolbox
  const { loadConfig } = config
  const { brand } = runtime

  const myConfig = loadConfig(brand, filesystem.cwd())

  const { repoOwner, repoName } = myConfig

  // location of the github config file
  const GITHUB_CONFIG = `${filesystem.homedir()}/.${brand}/.github`

  // memoize the Github Personal Access Token once we retrieve it
  let githubPersonalAccessToken = null

  const octokit = new Octokit()

  // get the Github Personal Access Token
  async function getPersonalAccessToken() {
    // if we've already retrieved it, return that
    if (githubPersonalAccessToken) return githubPersonalAccessToken

    // get it from the config file?
    githubPersonalAccessToken = await readPersonalAccessToken()

    // return the token
    return githubPersonalAccessToken
  }

  // read an existing Github Personal Access Token from the `GITHUB_CONFIG` file, defined above
  async function readPersonalAccessToken() {
    if (Boolean(filesystem.exists(GITHUB_CONFIG))) {
      const token = await filesystem.readAsync(GITHUB_CONFIG)
      return token
    }

    return null
  }

  // save a new Github Personal Access Token to the `GITHUB_CONFIG` file
  async function savePersonalAccessToken(token) {
    return filesystem.writeAsync(GITHUB_CONFIG, token)
  }

  // get list of commits of a repository
  async function getCommits({ base = 'v0.0.0', head = 'main' }) {
    await getPersonalAccessToken()

    const { data } = await octokit.request(
      `GET /repos/{owner}/{repo}/compare/{basehead}`,
      {
        owner: repoOwner,
        repo: repoName,
        basehead: `${base}...${head}`,
        per_page: 100,
        headers: {
          authorization: `token ${githubPersonalAccessToken}`,
        },
      }
    )

    return data.commits ?? []
  }

  async function resetConfigs() {
    await filesystem.removeAsync(GITHUB_CONFIG)
  }

  // attach our tools to the toolbox
  toolbox.github = {
    getPersonalAccessToken,
    savePersonalAccessToken,
    getCommits,
    resetConfigs,
  }
}
