const CONFIRM_MESSAGE =
  'Are you sure you want to reset the Github Personal Access Token?'

/**
 * @type {import('gluegun').GluegunCommand}
 */
module.exports = {
  name: 'reset',
  run: async (toolbox) => {
    // retrieve the tools from the toolbox that we will need
    const { prompt, print, github } = toolbox

    // confirmation, because this is destructive
    if (await prompt.confirm(CONFIRM_MESSAGE)) {
      await github.resetConfigs()
      print.success('Done!')
    }
  },
}
