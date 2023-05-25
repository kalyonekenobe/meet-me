const pathResolver = require("../tools/path-resolver");
const User = require("../models/user.model");

const profile = async (req, res) => {
  try {
    res.render(pathResolver.views('user/profile'), { user: req.user })
  } catch (error) {
    console.log(error)
  }
}

const details = async (req, res) => {
  try {
    const { id } = req.query
    const user = await User.findById({ id })

    res.render(pathResolver.views('user/details'), { user })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { profile, details }