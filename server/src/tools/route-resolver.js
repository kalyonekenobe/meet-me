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
  }
}

module.exports = resolver