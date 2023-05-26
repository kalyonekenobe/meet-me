const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  },
  location: {
    type: String,
  },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User