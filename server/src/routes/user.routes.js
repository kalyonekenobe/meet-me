const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {profile, details} = require("../controllers/user.controller");
const router = express.Router()

router.get('/profile', requiresAuth(), profile)
router.get('/users/details/:id', requiresAuth(), details)

module.exports = router