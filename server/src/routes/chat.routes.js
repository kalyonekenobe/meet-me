const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {chats} = require("../controllers/chat.controller");
const router = express.Router()

router.get('/chats', requiresAuth(), chats)

module.exports = router