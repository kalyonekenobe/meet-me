const fs= require('fs')
const pathResolver = require("./path-resolver");
const path = require("path");

const resolver = {
  setupRoutes: app => {
    const routesDirectory = pathResolver.specificFolder('../routes/')
    fs.readdir(routesDirectory, (err, files) => {
      if (!err) {
        files.forEach(filename => {
          const file = path.parse(pathResolver.specificFile(filename))
          const router = require(pathResolver.routes(file.name))
          app.use(router)
        })
      } else {
        console.log(err)
      }
    })
  },
  setupRequestHeaders: app => {
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(process.env.X_ACCESS_TOKEN, req.cookies[process.env.X_ACCESS_TOKEN] ?? '')
      next()
    })
  }
}

module.exports = resolver