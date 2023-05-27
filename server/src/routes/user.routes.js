const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {profile, details, editProfile, updateProfile, joinRequests, processJoinRequest} = require("../controllers/user.controller");
const router = express.Router()

router.get('/profile', requiresAuth(), profile)
router.get('/users/details/:id', requiresAuth(), details)
router.get('/profile/edit', requiresAuth(), editProfile)
router.get('/profile/join-requests', requiresAuth(), joinRequests)
router.post('/profile/edit', requiresAuth(), updateProfile)
router.post('/profile/join-requests/:id/:action', requiresAuth(), processJoinRequest)

module.exports = router