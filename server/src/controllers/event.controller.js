const pathResolver = require("../tools/path-resolver");
const Event = require('../models/event.model')

const events = async (req, res) => {
  try {
    const payload = {
      title: "Hello, world!",
      events: await Event.find()
    }
    res.render(pathResolver.views('event/list'), payload)
  } catch (err) {
    console.log(err)
  }
}

const details = async (req, res) => {
  try {
    const { id } = req.query
    const payload = {
      title: "Hello, world!",
      event: await Event.findById({ id })
    }
    res.render(pathResolver.views('event/details'), payload)
  } catch (err) {
    console.log(err)
  }
}

const create = (req, res) => {
  try {
    const payload = {
      title: "Hello, world!",
    }
    res.render(pathResolver.views('event/create'), payload)
  } catch (err) {
    console.log(err)
  }
}

const edit = async (req, res) => {
  try {
    const { id } = req.query
    const payload = {
      title: "Hello, world!",
      event: await Event.findById({ id })
    }
    res.render(pathResolver.views('event/edit'), payload)
  } catch (err) {
    console.log(err)
  }
}

const add = async (req, res) => {
  try {
    const { event } = req.body
    const createdEvent = await Event.create(event)

    if (createdEvent) {
      res.status(200).json({ message: 'Event was successfully created!' })
    }

  } catch (err) {
    res.status(400).json({ error: 'Event creation error!' })
    console.log(err)
  }
}

const update = async (req, res) => {
  try {
    const { event } = req.body
    const updatedEvent = await Event.updateOne(event)

    if (updatedEvent) {
      res.status(200).json({ message: 'Event was successfully updated!' })
    }

  } catch (err) {
    res.status(400).json({ error: 'Event updating error!' })
    console.log(err)
  }
}

module.exports = { events, details, create, edit, add, update }
