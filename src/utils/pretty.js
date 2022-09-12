const { print } = require('gluegun')

const { info, colors } = print
const { gray, white, bold, red, underline, blue } = colors

const heading = (m = '') => info(white(bold(m)))

const link = (m = '') => underline(blue(m))

const cliHeading = () => {
  return info(
    red(
      bold(
        '· · · · · · · · · · · · 🔥 Faster Release CLI 🔥 · · · · · · · · · · · ·\n'
      )
    )
  )
}

const command = (message = '', second = '', examples = []) => {
  info(white(message) + '  ' + gray(second))

  const indent = message.length + 2

  if (examples) {
    examples.forEach((example) => info(gray(' '.repeat(indent) + example)))
  }
}

module.exports = {
  heading,
  link,
  cliHeading,
  command,
}
