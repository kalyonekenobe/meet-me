const mongoose = require('mongoose');
const Schema = mongoose.Schema

const chatSchema = new Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  messages: [new Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  }, { timestamps: true })],
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;