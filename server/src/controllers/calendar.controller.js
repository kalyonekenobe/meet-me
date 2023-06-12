const pathResolver = require("../tools/path-resolver");
const Calendar = require("../models/calendar.model");
const {notFound} = require("../tools/not-found");

// Renders calendar page
const details = async (req, res) => {
  try {
    const payload = {
      title: `Events calendar`,
      calendar: await Calendar.findOne({ user: req.user }),
      authenticatedUser: req.user,

    }
    if (payload.calendar) {
      return res.render(pathResolver.views('calendar/details'), payload)
    }
  } catch (error) {
    console.log(error)
  }

  return notFound(req, res)
}

module.exports = { details }