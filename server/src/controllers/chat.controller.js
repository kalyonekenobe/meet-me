const pathResolver = require("../tools/path-resolver");
const Chat = require("../models/chat.model");

const chats = async (req, res) => {
  try {
    const payload = {
      title: `Chats`,
      chats: await Chat.find()
    }

    return res.render(pathResolver.views('chat/list'), payload)
  } catch (err) {
    console.log(err)
  }

  return res.render(pathResolver.views('defaults/not-found'))
}

const details = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `Chat`,
      chat: await Chat.findById(id)
    }

    if (payload.chat) {
      payload.title = `Chat: '${payload.chat.event.title}'`
      return res.render(pathResolver.views('chat/details'), payload)
    }
  } catch (err) {
    console.log(err)
  }

  return res.render(pathResolver.views('defaults/not-found'))
}

module.exports = { chats, details }
