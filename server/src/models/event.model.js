const mongoose = require('mongoose')
const Calendar = require("./calendar.model");
const Schema = mongoose.Schema

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'default-event-image.jpg'
  },
  startsOn: {
    type: Date,
    required: true,
  },
  endsOn: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  additionalImages: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  joinRequests: [new Schema({
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      default: 'pending'
    },
    message: {
      type: String
    }
  }, { timestamps: true })],
  chat: {
    messages: [new Schema({
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
      }
    }, { timestamps: true })],
  }
}, { timestamps: true })

const Event = mongoose.model('Event', eventSchema)

module.exports = Event