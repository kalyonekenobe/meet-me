const mongoose = require('mongoose')
const Chat = require("./chat.model");
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
}, { timestamps: true })

const onDeleteOneCascade = async function (next) {
  const conditions = this._conditions

  try {
    await Chat.deleteMany({ event: conditions._id });

    await Calendar.updateMany(
      { events: conditions._id },
      { $pull: { events: conditions._id } }
    );

    next();
  } catch (error) {
    console.log(error)
    next(error);
  }
}

eventSchema.pre('findOneAndDelete', onDeleteOneCascade);
eventSchema.pre('deleteOne', onDeleteOneCascade);

const Event = mongoose.model('Event', eventSchema)

module.exports = Event