const express = require('express')
const app = express()
const routeResolver = require('./tools/route-resolver')

const port = 8000

app.set("view engine", "ejs")

routeResolver.setupRoutes(app)

app.listen(port, () => {
  console.log("Application is running")
})