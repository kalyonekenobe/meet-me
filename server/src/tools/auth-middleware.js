const jwt = require('jsonwebtoken')

const requiresAuth = (roles = []) => {
  return (req, res, next) => {
    const token = req.body.token || req.query.token || res.getHeaders()[process.env.X_ACCESS_TOKEN.toLowerCase()] || req.cookies[process.env.X_ACCESS_TOKEN]
    try {
      const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)

      if (roles.length > 0 && !roles.includes(tokenPayload.role)) {
        return res.reload()
      }

      req.user = tokenPayload
    } catch (error) {
      return res.redirect('/sign-in')
    }
    return next();
  }
}

module.exports = { requiresAuth }