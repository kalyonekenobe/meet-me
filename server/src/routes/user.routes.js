const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {profile, details, editProfile, updateProfile} = require("../controllers/user.controller");
const router = express.Router()

router.get('/profile', requiresAuth(), profile)
router.get('/users/details/:id', requiresAuth(), details)
router.get('/profile/edit', requiresAuth(), editProfile)
router.post('/profile/edit', requiresAuth(), updateProfile)

module.exports = router