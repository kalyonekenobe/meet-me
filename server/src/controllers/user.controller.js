const pathResolver = require("../tools/path-resolver");

const profile = async (req, res) => {
  try {
    res.render(pathResolver.views('user/profile'), { user: req.user })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { profile }