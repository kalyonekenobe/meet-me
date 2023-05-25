const pathResolver = require("../tools/path-resolver");
const Calendar = require("../models/calendar.model");

const details = async (req, res) => {
  try {
    const payload = {
      title: "Hello, world",
      calendar: Calendar.findOne({ user: req.user })
    }
    res.render(pathResolver.views('calendar/details'), payload)
  } catch (error) {
    console.log(error)
  }
}

module.exports = { details }