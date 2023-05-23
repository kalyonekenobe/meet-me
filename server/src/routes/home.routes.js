const express = require("express");
const {index} = require("../controllers/home.controller");
const router = express.Router()

router.get('/', index)
router.get('/home', index)

module.exports = router