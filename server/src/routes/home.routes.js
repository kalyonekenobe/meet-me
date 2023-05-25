const express = require("express");
const {index, profile, calendar} = require("../controllers/home.controller");
const {requiresAuth} = require("../tools/auth-middleware");
const router = express.Router()

router.get('/', requiresAuth(), index)
router.get('/home', requiresAuth(), index)
router.get('/profile', requiresAuth(), profile)
router.get('/calendar', requiresAuth(), calendar)

module.exports = router