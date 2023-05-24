const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const routeResolver = require('./tools/route-resolver')
require('dotenv').config()

const port = process.env.PORT || 8000

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.json())

routeResolver.setupRoutes(app)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.host);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(process.env.X_ACCESS_TOKEN, req.cookies[process.env.X_ACCESS_TOKEN] ?? '')
  next()
})

app.listen(port, () => {
  console.log(`Application is running on port ${port}`)
})