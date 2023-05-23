const express = require("express");
const {signIn, signUp, logout, login, register} = require("../controllers/auth.controller");
const router = express.Router()

router.get('/sign-in', signIn)
router.get('/sign-up', signUp)
router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register)

module.exports = router