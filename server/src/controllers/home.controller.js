const pathResolver = require('../tools/path-resolver')

const index = (req, res) => {
  const payload = {
    title: "Hello, world!",
  }
  res.render(pathResolver.views('home/index'), payload)
}

module.exports = { index }