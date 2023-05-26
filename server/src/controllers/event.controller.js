const pathResolver = require("../tools/path-resolver");
const Event = require('../models/event.model');
const {notFound} = require("../tools/not-found");
const crypto = require('crypto')
const fs = require('fs')

const events = async (req, res) => {
  try {
    const payload = {
      title: `Events`,
      events: await Event.find().populate('organizer')
    }

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
      event: await Event.findById(id).populate('organizer')
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

const create = (req, res) => {
  try {
    const payload = {
      title: `Create new event`,
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
      event: await Event.findById(id)
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
    const event = req.body
    const imageUploads = []

    if (req.files.image) {
      const imageName = `${crypto.randomUUID()}.${req.files.image.name.split('.').pop()}`
      const imagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)
      event.image = imageName
      imageUploads.push(req.files.image.mv(imagePath))
    }

    if (req.files.additionalImages) {
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
    const event = req.body
    const imageUploads = []

    if (req.files.image) {
      const imageName = `${crypto.randomUUID()}.${req.files.image.name.split('.').pop()}`
      const oldImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${req.files.image.name}`)
      const newImagePath = pathResolver.specificFile(`../../public/uploads/images/events/${imageName}`)

      if (!fs.existsSync(oldImagePath)) {
        event.image = imageName
        imageUploads.push(req.files.image.mv(newImagePath))
      }
    }

    if (req.files.additionalImages) {
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

    const updatedEvent = await Event.updateOne({ _id: id}, event)

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

module.exports = { events, details, create, edit, add, update, remove }
