const { p, command, heading, cliHeading } = require('../utils/pretty')

/**
 * @type {import('gluegun').GluegunCommand}
 */
module.exports = {
  dashed: true,
  name: 'help',
  alias: ['h'],
  description: 'Displays Faster Release CLI help',
  run: async (toolbox) => {
    const { meta } = toolbox

    p()
    cliHeading()
    heading(`Welcome to Faster Release ${meta.version()}!`)
    p()
    p('Faster Release is a CLI that helps you speed up a new release version.')
    p()
    heading('Commands')
    p()
    command('new         ', 'Initiates a new release version', [
      'faster-release new',
    ])
    p()
    command('reset       ', 'Reset saved Github configs', [
      'faster-release reset',
    ])
    p()
    cliHeading()
  },
}
