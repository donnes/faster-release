# Faster Release CLI

Manage releases versioning easily with Faster Release CLI.

## Getting Started

Create a file `.faster-releaserc.json` in the root level of your project with the bellow content.

```json
{
  "atlassianOrg": "", // optional, but required if you want to use Jira Conventional Commits
  "repoOwner": "donnes", // required
  "repoName": "faster-release" // required
}
```

## Install

```shell
# Yarn
$ yarn global add faster-release

# NPM
$ npm install -g faster-release
```

## How to use

```shell
# Initiate a new release
$ faster-release new

# Other commands
$ faster-release help
```
