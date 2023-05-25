const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {details} = require("../controllers/calendar.controller");
const router = express.Router()

router.get('/calendar', requiresAuth(), details)

module.exports = router