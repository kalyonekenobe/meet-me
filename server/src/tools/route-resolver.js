const fs= require('fs')
const pathResolver = require("./path-resolver");

const routeResolver = {
  setupRoutes: app => {
    fs.readdir(pathResolver.resolveFolderPath('../routes/'), (err, files) => {
      if (err) {
        console.log(err)
        return
      }

      files.forEach(file => {
        app.use(require(pathResolver.routes(pathResolver.getFileByFilename(file).name)))
      })
    })
  }
}

module.exports = routeResolver