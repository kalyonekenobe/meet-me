const pathResolver = require('../tools/path-resolver')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require("../models/user.model");
const e = require("express");

const signIn = (req, res) => {
  const payload = {
    title: "Sign In",
  }

  return res.render(pathResolver.views('auth/sign-in'), payload)
}

const signUp = (req, res) => {
  const payload = {
    title: "Sign Up",
  }

  return res.render(pathResolver.views('auth/sign-up'), payload)
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const fieldsAreNotEmpty = email && password

    if (!fieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    const user = await User.findOne({ email })

    if (user && await bcrypt.compare(password, user.password)) {

      const tokenPayload = {
        userId: user._id,
        email: email,
        role: user.role
      }

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: '30 days',
        issuer: req.headers.host,
      })

      res.cookie(process.env.X_ACCESS_TOKEN, token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })

      return res.status(200).json({ message: 'User was successfully logged in.' })
    }
  } catch (error) {
    console.log(error)
  }

  return res.status(401).json({ error: 'Wrong email or password!' })
}

const logout = (req, res) => {
  res.clearCookie(process.env.X_ACCESS_TOKEN)
  return res.status(200).json({ message: 'User was successfully logged out.' })
}

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth } = req.body
    const fieldsAreNotEmpty = firstName && lastName && email && password

    if (!fieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ error: 'User with such email already exists! Please, choose another email.' })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptedPassword,
      role: 'default-user',
      dateOfBirth: dateOfBirth
    })

    return res.status(200).json({ message: 'User was successfully registered.' })
  } catch (error) {
    console.log(error)
  }

  return res.status(400).json({ error: 'Bad request' })
}

module.exports = { signIn, signUp, login, logout, register }