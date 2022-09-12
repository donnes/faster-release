const semver = require('semver')
const { isEmpty } = require('radash')
const { cliHeading } = require('../utils/pretty')

module.exports = {
  dashed: true,
  name: 'new',
  description: 'Initiates a new release version',
  run: async (toolbox) => {
    const {
      config,
      runtime,
      filesystem,
      system,
      parameters,
      print,
      prompt,
      github,
      changelog,
    } = toolbox
    const { loadConfig } = config
    const { brand } = runtime
    const { info, error, muted, highlight, debug, spin, colors } = print
    const { red, yellow, bold } = colors
    const { options } = parameters

    // start tracking performance
    const perfStart = new Date().getTime()

    const myConfig = loadConfig(brand, filesystem.cwd())

    if (!filesystem.exists(`${filesystem.cwd()}/package.json`)) {
      error('No package.json found!')
      process.exit(0)
    }

    if (isEmpty(myConfig)) {
      error('No .faster-releaserc.json found! Follow the documentation guide.')
      process.exit(0)
    }

    const { name: packageName, version: packageCurrentVersion } =
      filesystem.read(`${filesystem.cwd()}/package.json`, 'json')

    cliHeading()
    highlight(`Releasing a new version for ${bold(red(packageName))}`)
    info('')

    const result = await prompt.ask([
      // {
      //   type: 'select',
      //   name: 'releaseFlow',
      //   message: 'Release flow?',
      //   choices: ['Release', 'Hotfix'],
      // },
      {
        type: 'select',
        name: 'releaseType',
        message: 'Release type?',
        choices: ['Major', 'Minor', 'Patch', 'PreRelease'],
      },
      {
        type: 'select',
        name: 'commitsType',
        message: 'Commits type?',
        choices: [
          'Jira Conventional - Ex.: "JIRA-ISSUE-ID: commit message"',
          'Conventional Commits - Ex.: "type(scope): commit message"',
        ],
      },
    ])

    // const releaseFlow = result.releaseFlow.toLowerCase()
    const releaseType = result.releaseType.toLowerCase()
    const commitsType = result.commitsType.startsWith('Jira')
      ? 'jira-conventional'
      : 'conventional-commits'

    const targetVersion = semver.inc(packageCurrentVersion, releaseType)
    const currentTag = `v${packageCurrentVersion}`.trim()
    const targetTag = `v${targetVersion}`.trim()
    const targetBranchName = `release/${targetVersion}`.trim()

    const currentTagText = yellow(currentTag)
    const targetTagText = yellow(targetTag)
    const releaseBranchText = yellow(targetBranchName)

    const spinner = spin('')

    // git checkout command
    spinner.start(bold(`Switching branch to ${releaseBranchText}`))
    try {
      await system.run(`git checkout -b ${targetBranchName}`)
      spinner.succeed()
    } catch (err) {
      if (options.debug) {
        spinner.fail()
        debug(err, `git checkout -b ${releaseBranchText}`)
      } else {
        spinner.fail(
          'Was not possible to switch branch, run it again with --debug'
        )
      }
      process.exit(0)
    }

    // fetch commits
    spinner.start(bold(`Fetching commits history`))
    let commits = []
    try {
      commits = await github.getCommits({
        base: currentTag,
        head: 'main',
      })
      spinner.succeed()
    } catch (err) {
      if (options.debug) {
        spinner.fail()
        debug(err, 'toolbox.github.getCommits()')
      } else {
        spinner.fail(
          'Was not possible to fetch commits, run it again with --debug'
        )
      }
      process.exit(0)
    }

    // npm version command
    spinner.start(
      bold(`Bumping version from ${currentTagText} to ${targetTagText}`)
    )
    try {
      await system.run(`npm version ${releaseType} --no-git-tag-version`)
      spinner.succeed()
    } catch (err) {
      if (options.debug) {
        spinner.fail()
        debug(err, `npm version ${releaseType} --no-git-tag-version`)
      } else {
        spinner.fail(
          'Was not possible to bump the version, run it again with --debug'
        )
      }
      process.exit(0)
    }

    const changelogText = yellow('CHANGELOG.md')
    const packageJsonText = yellow('package.json')

    // generate changelog
    spinner.start(bold(`Generating CHANGELOG.md`))
    try {
      await changelog.generate(targetVersion, commits, commitsType)
      spinner.succeed()
    } catch (err) {
      if (options.debug) {
        spinner.fail()
        debug(err, 'toolbox.changelog.generate()')
      } else {
        spinner.fail(
          'Was not possible to generate the CHANGELOG.md, run it again with --debug'
        )
      }
      process.exit(0)
    }

    // git commit command
    spinner.start(bold(`Commiting ${packageJsonText} and ${changelogText}`))
    try {
      await system.run('git add .')
      await system.run(`git commit -m "chore(release): ${targetTag}"`)
      spinner.succeed()
    } catch (err) {
      if (options.debug) {
        spinner.fail()
        debug(err, `git commit`)
      } else {
        spinner.fail(
          'Was not possible to commit changes, run it again with --debug'
        )
      }
      process.exit(0)
    }

    // git tag command
    spinner.start(bold(`Tagging release ${targetTagText}`))
    try {
      await system.run(`git tag ${targetTag}`)
      spinner.succeed()
    } catch (err) {
      if (err.message.includes('already exists')) {
        spinner.fail(`Tag ${targetTagText} already exists`)
      } else {
        spinner.fail()
      }

      if (options.debug) {
        debug(error, `git tag ${targetTag}`)
      } else {
        spinner.fail(
          'Was not possible to tag the release, run it again with --debug'
        )
      }
      process.exit(0)
    }

    // round performance stats to .xx digits
    const perfDuration =
      Math.round((new Date().getTime() - perfStart) / 10) / 100

    info('')
    muted('Run' + yellow(` git push -u --tag origin ${releaseBranchText}`))
    muted(`Everything done is just ${bold(`${perfDuration}s`)}`)
    info('')

    process.exit(0)
  },
}
