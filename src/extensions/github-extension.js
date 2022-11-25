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

  const octokit = new Octokit()

  // read an existing Github Personal Access Token from the `GITHUB_CONFIG` file, defined above
  async function readPersonalAccessToken() {
    if (Boolean(filesystem.exists(GITHUB_CONFIG))) {
      const token = await filesystem.readAsync(GITHUB_CONFIG)
      return token
    }

    return null
  }

  /**
   * checkPersonalAccessToken
   * @param {import('ora').Ora} spinner
   */
  async function checkPersonalAccessToken(spinner) {
    const token = await readPersonalAccessToken()

    console.log(token)

    if (!token) {
      spinner.stop()
      const result = await prompt.ask([
        {
          type: 'input',
          name: 'token',
          message: 'Please, enter your Github Personal Access Token',
        },
      ])
      await filesystem.writeAsync(GITHUB_CONFIG, result.token)
    }
  }

  // get list of commits of a repository
  async function getCommits({ base = 'v0.0.0', head = 'main' }) {
    const githubPersonalAccessToken = await readPersonalAccessToken()

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
    checkPersonalAccessToken,
    getCommits,
    resetConfigs,
  }
}
