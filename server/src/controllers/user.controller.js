const pathResolver = require("../tools/path-resolver");
const User = require("../models/user.model");

const profile = async (req, res) => {
  const payload = {
    title: `Profile`,
    user: req.user
  }

  if (payload.user) {
    return res.render(pathResolver.views('user/profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return res.render(pathResolver.views('defaults/not-found'))
}

const details = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `User details`,
      user: await User.findById(id)
    }

    if (payload.user) {
      payload.title = `${payload.user.firstName} ${payload.user.lastName}`
      return res.render(pathResolver.views('user/details'), payload)
    }

    return res.render(pathResolver.views('defaults/not-found'))
  } catch (error) {
    console.log(error)
    return res.render(pathResolver.views('defaults/not-found'))
  }
}

module.exports = { profile, details }