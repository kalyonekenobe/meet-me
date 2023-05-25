const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {events} = require("../controllers/event.controller");
const router = express.Router()

router.get('/', requiresAuth(), events)
router.get('/events', requiresAuth(), events)

module.exports = router