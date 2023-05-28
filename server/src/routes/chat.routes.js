const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {chats, details, sendMessage} = require("../controllers/chat.controller");
const router = express.Router()

router.get('/chats', requiresAuth(), chats)
router.get('/events/:id/chat', requiresAuth(), details)
router.post('/events/:id/chat/send-message', requiresAuth(), sendMessage)

module.exports = router