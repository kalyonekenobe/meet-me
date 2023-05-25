const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {profile} = require("../controllers/user.controller");
const router = express.Router()

router.get('/profile', requiresAuth(), profile)

module.exports = router