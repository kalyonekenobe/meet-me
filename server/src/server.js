require('dotenv').config()
require('./tools/database')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const AppRouter = require('./tools/app-router')
const appLocals = require('./tools/app-locals')
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const router = new AppRouter(app)



app.locals = appLocals

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(fileUpload({
  createParentPath: true
}))

app.use(cors({
  origin: `http://localhost:${port}`,
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}))

router.setupRequestsSettings()
router.setupRoutes()


app.listen(port, () => {
  console.log(`Application is running on port ${port}`)
})
