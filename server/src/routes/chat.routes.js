const express = require("express");
const {requiresAuth} = require("../tools/auth-middleware");
const {chats, details} = require("../controllers/chat.controller");
const router = express.Router()

router.get('/chats', requiresAuth(), chats)
router.get('/chats/details/:id', requiresAuth(), details)

module.exports = router