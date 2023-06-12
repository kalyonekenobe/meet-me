const mongoose = require('mongoose')
const Calendar = require("./calendar.model");
const Schema = mongoose.Schema

// Describes the user model in the database
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  profilePicture: {
    type: String,
    default: 'default-user-image.jpg',
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
}, { timestamps: true })

// Defines the behaviour of the model or related models when user is created
const onCreate = async user => {
  try {
    const existingCalendar = await Calendar.findOne({ user: user._id })

    if (!existingCalendar) {
      const calendar = {
        user: user,
        events: []
      }

      await Calendar.create(calendar)
    }
  } catch (error) {
    console.log(error)
  }
}

userSchema.post('save', onCreate)

const User = mongoose.model('User', userSchema)

module.exports = User