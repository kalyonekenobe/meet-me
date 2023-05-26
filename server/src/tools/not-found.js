const pathResolver = require("./path-resolver");
const notFound = (req, res) => {
  return res.render(pathResolver.views('defaults/not-found'))
}

module.exports = { notFound }