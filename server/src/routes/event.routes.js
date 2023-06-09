const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {events, details, create, edit, update, add, remove, join, list} = require("../controllers/event.controller");
const router = express.Router()

// Defined events routes
router.get('/', requiresAuth(), events)
router.get('/events', requiresAuth(), events)
router.get('/events/create', requiresAuth(), create)
router.get('/events/edit/:id', requiresAuth(), edit)
router.get('/events/:id', requiresAuth(), details)
router.post('/events/create', requiresAuth(), add)
router.post('/events', requiresAuth(), list)
router.post('/events/edit/:id', requiresAuth(), update)
router.post('/events/delete/:id', requiresAuth(), remove)
router.post('/events/join/:id', requiresAuth(), join)

module.exports = router