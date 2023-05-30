const pathResolver = require("../tools/path-resolver");
const Event = require("../models/event.model");
const {notFound} = require("../tools/not-found");

const chats = async (req, res) => {
  try {
    const events = await Event.find({ participants: { $elemMatch: { $eq: req.user } } }).select('chat')
    const payload = {
      title: `Chats`,
      chats: events.map(event => event.chat),
      authenticatedUser: req.user,
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
    const event = await Event.findOne({ _id: id, participants: { $elemMatch: { $eq: req.user } } })

    if (event) {
      const payload = {
        title: `Chat: ${event.title}`,
        chat: event.chat,
        authenticatedUser: req.user
      }

      return res.render(pathResolver.views('chat/details'), payload)
    }
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params
    const requiredFieldsAreNotEmpty = req.user && req.body.message && req.body.message.trim() !== ''

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Cannot send empty message!' })
    }

    const message = {
      sender: req.user,
      message: req.body.message,
      authenticatedUser: req.user,
    }

    const sentMessage = await Event.updateOne({ _id: id }, {
      $push: {
        'chat.messages': message
      }
    }, { new: true })

    if (sentMessage) {
      return res.status(200).json({ message: 'Message was successfully sent.' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Message was not sent! Please, try again' })
}

module.exports = { chats, details, sendMessage }
