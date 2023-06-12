const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {chats, details, sendMessage} = require("../controllers/chat.controller");
const router = express.Router()

// Defined chats routes
router.get('/chats', requiresAuth(), chats)
router.get('/chats/event/:id', requiresAuth(), details)
router.post('/chats/event/:id/send-message', requiresAuth(), sendMessage)

module.exports = router