const fs = require('fs')
const pathResolver = require("./path-resolver");
const path = require("path");
const {notFound} = require("./not-found");
const {getAuthenticatedUser} = require("./auth-middleware");

// Application router
class AppRouter {

  static #routesDirectory = pathResolver.specificFolder('../routes/')
  #app

  constructor(app) {
    this.#app = app
  }

  // Setups routes
  setupRoutes() {
    fs.readdir(AppRouter.#routesDirectory, (err, files) => {
      if (!err) {
        files.forEach(filename => {
          const file = path.parse(pathResolver.specificFile(filename))
          const router = require(pathResolver.routes(file.name))
          this.#app.use(router)
        })

        this.#app.get('*', notFound)
      } else {
        console.log(err)
      }
    })
  }

  // Setups requests settings. Sets headers, authenticatedUser, etc.
  setupRequestsSettings() {
    this.#app.use(async (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(process.env.X_ACCESS_TOKEN, req.cookies[process.env.X_ACCESS_TOKEN] ?? '')
      req.user = await getAuthenticatedUser(req, res)
      next()
    })
  }
}

module.exports = AppRouter