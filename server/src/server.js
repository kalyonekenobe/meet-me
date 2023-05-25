require('./tools/database')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const routeResolver = require('./tools/route-resolver')
const express = require('express')
const app = express()

const port = process.env.PORT || 8000

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))
app.use(cors({ origin: `http://localhost:${port}`, credentials: true }))

routeResolver.setupRoutes(app)
routeResolver.setupRequestHeaders(app)

app.listen(port, () => {
  console.log(`Application is running on port ${port}`)
})