const pathResolver = require("../tools/path-resolver");
const Chat = require("../models/chat.model");
const {notFound} = require("../tools/not-found");

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

  return notFound(req, res)
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

  return notFound(req, res)
}

module.exports = { chats, details }
