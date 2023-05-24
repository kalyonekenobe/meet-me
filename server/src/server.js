require('./tools/database')
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const cookieParser = require('cookie-parser')
const routeResolver = require('./tools/route-resolver')
const User = require("./models/user.model");

const port = process.env.PORT || 8000

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.json())
app.use(express.static(__dirname));

app.use(cors({ origin: `http://localhost:${port}`, credentials: true, }));

routeResolver.setupRoutes(app)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(process.env.X_ACCESS_TOKEN, req.cookies[process.env.X_ACCESS_TOKEN] ?? '')
  next()
})

app.listen(port, () => {
  console.log(`Application is running on port ${port}`)
})