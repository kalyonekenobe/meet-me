const pathResolver = require("../tools/path-resolver");

const calendar = async (req, res) => {
  try {
    res.render(pathResolver.views('calendar/calendar'), { user: req.user })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { calendar }