const pathResolver = require('../tools/path-resolver')

const index = (req, res) => {
  const payload = {
    title: "Hello, world!",
  }
  res.render(pathResolver.views('home/index'), payload)
}

const profile = async (req, res) => {
  try {
    res.render(pathResolver.views('home/profile'), { user: req.user })
  } catch (error) {
    console.log(error)
  }
}

const calendar = async (req, res) => {
  try {
    res.render(pathResolver.views('home/calendar'), { user: req.user })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { index, profile, calendar }