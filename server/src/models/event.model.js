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
  date: {
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

const onDeleteCascade = async next => {
  const {_id} = this._conditions

  try {
    await Chat.deleteMany({event: _id})

    await Calendar.updateMany(
      {events: _id},
      {$pull: {events: _id}}
    )

    next();
  } catch (error) {
    console.log(error)
    next(error);
  }
}

eventSchema.pre('findOneAndDelete', onDeleteCascade)
eventSchema.pre('deleteMany', onDeleteCascade)
eventSchema.pre('deleteOne', onDeleteCascade)

const Event = mongoose.model('Event', eventSchema)

module.exports = Event