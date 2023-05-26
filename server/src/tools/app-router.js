const fs= require('fs')
const pathResolver = require("./path-resolver");
const path = require("path");

class AppRouter {

  static #routesDirectory = pathResolver.specificFolder('../routes/')

  constructor(app) {
    this.app = app
  }

  setupRoutes() {
    fs.readdir(AppRouter.#routesDirectory, (err, files) => {
      if (!err) {
        files.forEach(filename => {
          const file = path.parse(pathResolver.specificFile(filename))
          const router = require(pathResolver.routes(file.name))
          this.app.use(router)
        })
      } else {
        console.log(err)
      }
    })
  }

  setupRequestsSettings() {
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(process.env.X_ACCESS_TOKEN, req.cookies[process.env.X_ACCESS_TOKEN] ?? '')
      next()
    })
  }
}

module.exports = AppRouter