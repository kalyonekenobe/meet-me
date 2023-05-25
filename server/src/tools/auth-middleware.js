const jwt = require('jsonwebtoken')

const requiresAuth = (roles = []) => {
  return (req, res, next) => {
    const token = req.body.token || req.query.token || res.getHeader(process.env.X_ACCESS_TOKEN.toLowerCase()) || req.cookies[process.env.X_ACCESS_TOKEN]
    const responsePayload = {
      error: undefined
    }

    try {
      const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)

      if (roles.length > 0 && !roles.includes(tokenPayload.role)) {
        if (req.method !== 'GET') {
          responsePayload.error = 'Access rights are missing.'
          return res.status(403).json(responsePayload)
        }
        return res.reload()
      }

      req.user = tokenPayload
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

module.exports = { requiresAuth }