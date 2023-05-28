const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {events, details, create, edit, update, add, remove, join} = require("../controllers/event.controller");
const router = express.Router()

router.get('/', requiresAuth(), events)
router.get('/events', requiresAuth(), events)
router.get('/events/:id', requiresAuth(), details)
router.get('/events/create', requiresAuth(), create)
router.get('/events/edit/:id', requiresAuth(), edit)
router.post('/events/create', requiresAuth(), add)
router.post('/events/edit/:id', requiresAuth(), update)
router.post('/events/delete/:id', requiresAuth(), remove)
router.post('/events/join/:id', requiresAuth(), join)

module.exports = router