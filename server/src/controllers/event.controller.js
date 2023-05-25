const pathResolver = require("../tools/path-resolver");

const events = (req, res) => {
  const payload = {
    title: "Hello, world!",
  }
  res.render(pathResolver.views('event/events'), payload)
}

module.exports = { events }
