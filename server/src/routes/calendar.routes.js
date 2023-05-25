const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {calendar} = require("../controllers/calendar.controller");
const router = express.Router()

router.get('/calendar', requiresAuth(), calendar)

module.exports = router