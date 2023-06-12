const jwt = require('jsonwebtoken')
const User = require("../models/user.model");

// Checks if the user who sends the request is authenticated and has an appropriate role to send the request on the specific endpoint
const requiresAuth = (roles = []) => {
  return async (req, res, next) => {
    const responsePayload = {
      error: undefined
    }

    try {
      const user = await getAuthenticatedUser(req, res)

      if (!user) {
        throw new Error('User is not authenticated!')
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        if (req.method !== 'GET') {
          responsePayload.error = 'Access rights are missing.'
          return res.status(403).json(responsePayload)
        }
        return res.reload()
      }

      req.user = user
    } catch (error) {
      if (req.method !== 'GET') {
        responsePayload.error = 'X-Access-Token is invalid or missing! Unauthorized user.'
        return res.status(401).json(responsePayload)
      }
      return res.redirect('/sign-in')
    }
    return next();
  }
}

// Fetches the authenticated user from jwt token that is stored in cookies or request headers
const getAuthenticatedUser = async (req, res) => {
  try {
    const token = req.body.token || req.query.token || res.getHeader(process.env.X_ACCESS_TOKEN.toLowerCase()) || req.cookies[process.env.X_ACCESS_TOKEN]
    const { email } = jwt.verify(token, process.env.JWT_SECRET)

    return await User.findOne({ email })
  } catch (err) {
    console.log(err)
  }
}

module.exports = { requiresAuth, getAuthenticatedUser }