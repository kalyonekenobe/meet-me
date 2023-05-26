const pathResolver = require("../tools/path-resolver");
const User = require("../models/user.model");
const {notFound} = require("../tools/not-found");

const profile = async (req, res) => {
  const payload = {
    title: `Profile`,
    user: req.user
  }

  if (payload.user) {
    return res.render(pathResolver.views('user/profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return notFound(req, res)
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
  } catch (error) {
    console.log(error)
  }

  return notFound(req, res)
}

module.exports = { profile, details }