const pathResolver = require("../tools/path-resolver");
const Event = require('../models/event.model');

const events = async (req, res) => {
  try {
    const payload = {
      title: `Events`,
      events: await Event.find()
    }

    return res.render(pathResolver.views('event/list'), payload)
  } catch (err) {
    console.log(err)
  }

  return res.render(pathResolver.views('defaults/not-found'))
}

const details = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `Event details`,
      event: await Event.findById(id)
    }

    if (payload.event) {
      payload.title = payload.event.title
      return res.render(pathResolver.views('event/details'), payload)
    }
  } catch (err) {
    console.log(err)
  }

  return res.render(pathResolver.views('defaults/not-found'))
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

  return res.render(pathResolver.views('defaults/not-found'))
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

  return res.render(pathResolver.views('defaults/not-found'))
}

const add = async (req, res) => {
  try {
    const { event } = req.body
    const createdEvent = await Event.create(event)

    if (createdEvent) {
      return res.status(200).json({ message: 'Event was successfully created!' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Event creation error!' })
}

const update = async (req, res) => {
  try {
    const { event } = req.body
    const updatedEvent = await Event.updateOne(event)

    if (updatedEvent) {
      return res.status(200).json({ message: 'Event was successfully updated!' })
    }

  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Event updating error!' })
}

module.exports = { events, details, create, edit, add, update }
