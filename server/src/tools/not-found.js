const pathResolver = require("./path-resolver");

// Renders the "Not Found" page if the user gets to the invalid endpoint
const notFound = (req, res) => {
  return res.render(pathResolver.views('defaults/not-found'))
}

module.exports = { notFound }