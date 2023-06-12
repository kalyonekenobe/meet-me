require('dotenv').config()
require('./tools/database')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const AppRouter = require('./tools/app-router')
const Socket = require('./tools/socket')
const appLocals = require('./tools/app-locals')
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const router = new AppRouter(app)
const socket = new Socket(app)

// Sets application local files
app.locals = appLocals

// Sets application view engine
app.set("view engine", "ejs")

// Forces the application to user cookie parser, json parser, form data parser and defines static files path
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Configures file uploading utilities
app.use(fileUpload({
  createParentPath: true
}))

// Configures application CORS
app.use(cors({
  origin: `http://localhost:${port}`,
  credentials: true
}))

// Configures application sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}))

// Setups routes and their settings
router.setupRequestsSettings()
router.setupRoutes()

// Configures sockets
socket.configure()

// Forces the application to listen the specific port
app.listen(port, () => {
  console.log(`Application is running on port ${port}`)
})
