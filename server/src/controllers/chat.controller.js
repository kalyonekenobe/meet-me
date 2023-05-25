const pathResolver = require("../tools/path-resolver");

const chats = (req, res) => {
  const payload = {
    title: "Hello, world!",
  }
  res.render(pathResolver.views('chat/chats'), payload)
}

module.exports = { chats }
