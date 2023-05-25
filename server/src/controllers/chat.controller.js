const pathResolver = require("../tools/path-resolver");
const Chat = require("../models/chat.model");

const chats = async (req, res) => {
  try {
    const payload = {
      title: "Hello, world!",
      chats: await Chat.find()
    }
    res.render(pathResolver.views('chat/list'), payload)
  } catch (err) {
    console.log(err)
  }
}

const details = async (req, res) => {
  try {
    const { id } = req.query
    const payload = {
      title: "Hello, world!",
      chat: await Chat.findById({ id })
    }
    res.render(pathResolver.views('chat/details'), payload)
  } catch (err) {
    console.log(err)
  }
}

module.exports = { chats, details }
