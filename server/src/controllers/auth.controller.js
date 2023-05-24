const pathResolver = require('../tools/path-resolver')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require("../models/user.model");
const e = require("express");

const signIn = (req, res) => {
  const payload = {
    title: "Sign In",
  }
  res.render(pathResolver.views('auth/sign-in'), payload)
}

const signUp = (req, res) => {
  const payload = {
    title: "Sign Up",
  }
  res.render(pathResolver.views('auth/sign-up'), payload)
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const fieldsAreNotEmpty = email && password

    if (!fieldsAreNotEmpty) {
      res.status(422).send('Some of required fields are empty!')
    }

    const user = await User.findOne({ email })

    if (user && await bcrypt.compare(password, user.password)) {

      const tokenPayload = {
        userId: user._id,      // Must be replaced by user id from database
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

      res.redirect('/')
    } else {
      res.status(401).send('Wrong email or password!')
    }
  } catch (error) {
    console.log(error)
  }
}

const logout = (req, res) => {
  res.clearCookie(process.env.X_ACCESS_TOKEN)
  res.redirect('sign-in')
}

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth } = req.body
    const fieldsAreNotEmpty = firstName && lastName && email && password

    if (!fieldsAreNotEmpty) {
      res.status(422).send('Some of required fields are empty!')
    }

    const existingUser = await User.findOne({ email })        // Must be replaced with request to database

    if (existingUser) {
      res.status(409).send('User with such email already exists! Please, choose another email.')
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

    res.redirect('sign-in')

  } catch (error) {
    console.log(error)
  }
}

module.exports = { signIn, signUp, login, logout, register }