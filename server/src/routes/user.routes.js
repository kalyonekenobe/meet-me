const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {profile, details, editProfile, updateProfile, joinRequests, processJoinRequest, myEvents} = require("../controllers/user.controller");
const router = express.Router()

// Defined users routes
router.get('/profile', requiresAuth(), profile)
router.get('/users/:id', requiresAuth(), details)
router.get('/profile/edit', requiresAuth(), editProfile)
router.get('/profile/join-requests/:type', requiresAuth(), joinRequests)
router.post('/profile/edit', requiresAuth(), updateProfile)
router.post('/profile/join-requests/:id/:action', requiresAuth(), processJoinRequest)
router.post('/profile/my-events', requiresAuth(), myEvents)

module.exports = router