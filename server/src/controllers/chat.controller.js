const pathResolver = require("../tools/path-resolver");
const Event = require("../models/event.model");
const {notFound} = require("../tools/not-found");

const chats = async (req, res) => {
  try {
    const events = await Event.find({ participants: { $elemMatch: { $eq: req.user } } }).populate('chat.messages.sender')
    const payload = {
      title: `Chats`,
      events: events,
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
    const events = await Event.find({ participants: { $elemMatch: { $eq: req.user } } }).populate('chat.messages.sender')
    const event = await Event.findOne({ _id: id, participants: { $elemMatch: { $eq: req.user } } }).populate('chat.messages.sender')

    if (event) {
      const payload = {
        title: `Chat: ${event.title}`,
        events: events,
        event: event,
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
    }

    const updatedEvent = await Event.findOneAndUpdate({ _id: id }, {
      $push: {
        'chat.messages': message
      }
    }, { new: true }).populate('chat.messages.sender')

    if (updatedEvent) {
      const sentMessageIndex = updatedEvent.chat.messages.findLastIndex(message => message.sender._id.toString() === req.user._id.toString())
      if (sentMessageIndex) {
        const sentMessage = updatedEvent.chat.messages[sentMessageIndex]

        const currentMessageDate = sentMessage.createdAt
        const previousMessageDate = sentMessageIndex > 0 ? updatedEvent.chat.messages[sentMessageIndex - 1].createdAt : new Date(1970, 1, 1)
        const nextMessageDate = sentMessageIndex < updatedEvent.chat.messages.length - 1 ? updatedEvent.chat.messages[sentMessageIndex + 1].createdAt : new Date(1970, 1, 1)

        const sameMessageBefore = !((sentMessageIndex > 0 && sentMessage.sender._id.toString() !== updatedEvent.chat.messages[sentMessageIndex - 1].sender._id.toString()) || sentMessageIndex === 0)

        const isNewMessageDate = currentMessageDate.getDate() !== previousMessageDate.getDate()
          || currentMessageDate.getMonth() !== previousMessageDate.getMonth()
          || currentMessageDate.getFullYear() !== previousMessageDate.getFullYear()

        const isNextMessageNewDate = currentMessageDate.getDate() !== nextMessageDate.getDate()
          || currentMessageDate.getMonth() !== nextMessageDate.getMonth()
          || currentMessageDate.getFullYear() !== nextMessageDate.getFullYear()

        return res.status(200).json({
          message: 'Message was successfully sent.',
          sentMessage: sentMessage,
          sameSenderBefore: sameMessageBefore,
          isNewMessageDate: isNewMessageDate,
          isNextMessageNewDate: isNextMessageNewDate
        })
      }
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Message was not sent! Please, try again' })
}

module.exports = { chats, details, sendMessage }
