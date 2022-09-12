const { system, filesystem } = require('gluegun')

const src = filesystem.path(__dirname, '..')
const { version } = filesystem.read(
  filesystem.path(__dirname, '../package.json'),
  'json'
)

const cli = async (cmd) => {
  system.run(
    'node ' + filesystem.path(src, 'bin', 'faster-release') + ` ${cmd}`
  )
}

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain(version)
})
