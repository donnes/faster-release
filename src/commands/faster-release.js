/**
 * @type {import('gluegun').GluegunCommand}
 */
module.exports = {
  description: '🔥 The Faster Release CLI 🔥',
  run: async (toolbox) => {
    const {
      parameters: { first },
      print: { error },
    } = toolbox

    if (first !== undefined) {
      error(`faster-release '${first}' is not a command`)
    } else {
      return require('./help').run(toolbox)
    }
  },
}
