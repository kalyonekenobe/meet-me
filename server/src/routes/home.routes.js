const express = require("express");
const {index} = require("../controllers/home.controller");
const {requiresAuth} = require("../tools/auth-middleware");
const router = express.Router()

router.get('/', requiresAuth(), index)
router.get('/home', requiresAuth(), index)

module.exports = router