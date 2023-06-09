const pathResolver = require("../tools/path-resolver");
const User = require("../models/user.model");
const Event = require("../models/event.model")
const {notFound} = require("../tools/not-found");
const crypto = require("crypto");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Calendar = require("../models/calendar.model");

// Renders user profile page
const profile = async (req, res) => {
  const payload = {
    title: `Profile`,
    authenticatedUser: req.user,
    events : await Event.find({ organizer: req.user._id })
  }
  if (payload.authenticatedUser) {
    return res.render(pathResolver.views('user/profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return notFound(req, res)
}

// Renders the page with full information about the user
const details = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    const events = await Event.find({ organizer: user })

    const payload = {
      title: `User details`,
      user: user,
      events: events,
      authenticatedUser: req.user
    }

    if (payload.user) {
      payload.title = `${payload.user.firstName} ${payload.user.lastName}`
      return res.render(pathResolver.views('user/details'), payload)
    }
  } catch (error) {
    console.log(error)
  }

  return notFound(req, res)
}

// Renders the page with edit user profile form
const editProfile = async (req, res) => {
  const payload = {
    title: `Edit profile`,
    authenticatedUser: req.user
  }

  if (payload.authenticatedUser) {
    return res.render(pathResolver.views('user/edit-profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return notFound(req, res)
}

// Handles edit user profile POST request, saves the updated user in the database and sends the response to the client
const updateProfile = async (req, res) => {
  try {
    const { _id, email, password } = req.user
    const imageUploads = []

    const user = { ...req.body, _id, email}
    const requiredFieldsAreNotEmpty = user.firstName && user.lastName && user.email && user.dateOfBirth

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    if (user.password && user.password.trim() !== '') {
      user.password = await bcrypt.hash(req.body.password, 10)
    } else {
      user.password = password
    }


    if (req.files?.profilePicture) {
      const imageName = `${crypto.randomUUID()}.${req.files.profilePicture.name.split('.').pop()}`
      const oldImagePath = pathResolver.specificFile(`../../public/uploads/images/users/${req.files.profilePicture.name}`)
      const newImagePath = pathResolver.specificFile(`../../public/uploads/images/users/${imageName}`)

      if (!fs.existsSync(oldImagePath)) {
        user.profilePicture = imageName
        imageUploads.push(req.files.profilePicture.mv(newImagePath))
      }
    } else {
      user.profilePicture = 'default-user-image.jpg'
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, user)

    if (updatedUser) {
      await Promise.all(imageUploads)
      return res.status(200).json({ message: 'User profile was successfully updated!' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'User profile updating error!' })
}

// Renders the join requests list page
const joinRequests = async (req, res) => {

  try {
    const { type } = req.params

    let events;
    switch (type) {
      case 'income':
        events = await Event.find({ organizer: req.user._id }).select('title _id joinRequests').populate('joinRequests joinRequests.candidate')
        break;
      case 'outcome':
        events = await Event.find({
          'joinRequests.candidate': {
            $in: [ req.user ]
          },
        }).select('title _id joinRequests').populate('joinRequests joinRequests.candidate')
        events.forEach(event => {
          event.joinRequests = event.joinRequests.filter(request => request.candidate._id.toString() === req.user._id.toString())
        })
        break;
    }

    let joinRequests = []

    events.forEach(event => {
      event.joinRequests.forEach(request => {
        joinRequests.push({
          event: {
            _id: event._id,
            title: event.title
          },
          ...request._doc
        })
      })
    })

    joinRequests.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    const payload = {
      title: `My join requests`,
      joinRequests: joinRequests,
      type: type,
      authenticatedUser: req.user
    }

    if (req.user) {
      return res.render(pathResolver.views('user/profile-join-requests'), payload)
    }

    console.log('Cannot show profile page because req.user is undefined!')
  } catch (err) {
    console.log(err)
  }

  return notFound(req, res)
}

// Handles process join request POST request, saves the updated join request in the database and sends the response to the client
const processJoinRequest = async (req, res) => {
  try {
    const { id, action } = req.params
    const validActions = ['accept', 'reject']

    if (!validActions.includes(action)) {
      return res.status(404).json({ error: 'Not found' })
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        joinRequests: {
          $elemMatch: {
            _id: id,
            status: 'pending'
          }
        },
        organizer: {
          $eq: req.user
        }
      },
      {
        $set: {
          'joinRequests.$.status': action === 'accept' ? 'accepted' : 'rejected',
        },
      },
      { new: true }
    )

    if (updatedEvent) {
      const joinRequest = updatedEvent.joinRequests.find(request => request._id.toString() === id)
      if (joinRequest?.status === 'accepted') {
        const participant = updatedEvent.participants.find(participant => participant._id.toString() === joinRequest.candidate._id.toString())
        if (!participant) {
          updatedEvent.participants.push(joinRequest.candidate)
          await updatedEvent.save()
        }
        await Calendar.updateOne({ user: joinRequest.candidate }, {
          $addToSet: {
            events: updatedEvent._id
          }
        }, { new: true })
      }
      return res.status(200).json({ message: `Join request was ${joinRequest?.status}` })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Cannot process join request!' })
}

// Handles fetch my events list POST request and sends the response to the client
const myEvents = async (req, res) => {
  try {
    const calendar = await Calendar.findOne({ user: req.user }).select('events').populate('events')
    if (calendar) {
      const events = calendar.events
      return res.status(200).json({ message: 'User events were successfully fetched!', events: events })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'Bad request!' })
}

module.exports = { profile, details, editProfile, updateProfile, joinRequests, processJoinRequest, myEvents }