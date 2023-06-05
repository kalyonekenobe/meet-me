const mongoose = require('mongoose');
const Schema = mongoose.Schema

const calendarSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
}, { timestamps: true });

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;

