const pathResolver = require("../tools/path-resolver");
const Event = require('../models/event.model');
const {notFound} = require("../tools/not-found");
const crypto = require('crypto')
const fs = require('fs')
const Calendar = require("../models/calendar.model");

const events = async (req, res) => {
  try {
    const payload = {
      title: `Events`,
      events: await Event.find().populate('organizer'),
      authenticatedUser: req.user,
    }
    console.log(payload.events)
    return res.render(pathResolver.views('event/list'), payload)
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

const details = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `Event details`,
      event: await Event.findById(id).populate('organizer'),
      authenticatedUser: req.user,
    }

    if (payload.event) {
      payload.title = payload.event.title
      return res.render(pathResolver.views('event/details'), payload)
    }
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

const create = async (req, res) => {
  try {
    const payload = {
      title: `Create new event`,
      authenticatedUser: req.user,
    }

    return res.render(pathResolver.views('event/create'), payload)
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

const edit = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `Edit event`,
      event: await Event.findById(id),
      authenticatedUser: req.user,
    }

    if (payload.event) {
      return res.render(pathResolver.views('event/edit'), payload)
    }
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

const add = async (req, res) => {
  try {
    const event = { ...req.body, organizer: req.user, participants: [ req.user ] }
    const imageUploads = []
    const requiredFieldsAreNotEmpty = event.title && event.description && event.date && event.location && event.organizer

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    if (new Date(event.date).getTime() < Date.now()) {
      return res.status(422).json({ error: 'Cannot set event date in the past!' })
    }

    if (req.files?.image) {
      const imageName = `${crypto.randomUUID()}.${req.files.image.name.split('.').pop()}`
      const imagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)
      event.image = imageName
      imageUploads.push(req.files.image.mv(imagePath))
    }

    if (req.files?.additionalImages) {
      event.additionalImages = req.files.additionalImages.map(image => {
        const imageName = `${crypto.randomUUID()}.${image.name.split('.').pop()}`
        const imagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)
        imageUploads.push(image.mv(imagePath))
        return imageName
      })
    }

    const createdEvent = await Event.create(event)

    if (createdEvent) {
      await Promise.all(imageUploads)
      await Calendar.updateOne({ user: req.user }, {
        $addToSet: {
          'events': createdEvent
        }
      })
      return res.status(200).json({ message: 'Event was successfully created!' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Event creation error!' })
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const event = { ...req.body, organizer: req.user }
    const imageUploads = []
    const requiredFieldsAreNotEmpty = event.title && event.description && event.date && event.location && event.organizer

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    if (new Date(event.date).getTime() < Date.now()) {
      return res.status(422).json({ error: 'Cannot set event date in the past!' })
    }

    if (req.files?.image) {
      const imageName = `${crypto.randomUUID()}.${req.files.image.name.split('.').pop()}`
      const oldImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${req.files.image.name}`)
      const newImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)

      if (!fs.existsSync(oldImagePath)) {
        event.image = imageName
        imageUploads.push(req.files.image.mv(newImagePath))
      }
    } else {
      event.image = 'default-event-image.jpg'
    }

    if (req.files?.additionalImages) {
      event.additionalImages = req.files.additionalImages.map(image => {
        const imageName = `${crypto.randomUUID()}.${image.name.split('.').pop()}`
        const oldImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${image.name}`)
        const newImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)

        if (!fs.existsSync(oldImagePath)) {
          imageUploads.push(image.mv(newImagePath))
          return imageName
        }
        return image.name
      })
    }

    const updatedEvent = await Event.updateOne({ _id: id }, event)

    if (updatedEvent) {
      await Promise.all(imageUploads)
      return res.status(200).json({ message: 'Event was successfully updated!' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Event updating error!' })
}

const remove = async (req, res) => {
  try {
    const { id } = req.params

    const deletedEvent = await Event.findByIdAndDelete(id)

    if (deletedEvent) {
      return res.status(200).json({ message: 'Event was successfully deleted.' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Event removal error!' })
}

const join = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    const joinRequest = {
      candidate: req.user,
      message: message
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id,
              $or: [
                { 'joinRequests.candidate': { $ne: req.user._id } },
                { 'joinRequests.candidate': { $eq: req.user._id }, 'joinRequests.status': { $nin: [ 'accepted', 'pending' ] } }
              ]
            },
      { $addToSet: { joinRequests: joinRequest } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Join request already exists or event was not found!' })
    }

    return res.status(200).json({ message: 'Join request was successfully sent!' })
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Join request error!' })
}

const list = async (req, res) => {
  try {
    const events = await Event.find()
      .select('id title description image date location organizer participants createdAt updatedAt')
      .populate('organizer')

    return res.status(200).json({ message: 'Event list was successfully fetched!', events: events })
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Bad request!' })
}

module.exports = { events, details, create, edit, add, update, remove, join, list }
