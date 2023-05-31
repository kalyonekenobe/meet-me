const pathResolver = require('../tools/path-resolver')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require("../models/user.model");
const e = require("express");
const crypto = require("crypto");
const fs = require("fs");

const signIn = async (req, res) => {
  if (req.user) {
    return res.redirect('/')
  }

  const payload = {
    title: "Sign In",
  }

  return res.render(pathResolver.views('auth/sign-in'), payload)
}

const signUp = async (req, res) => {
  if (req.user) {
    return res.redirect('/')
  }

  const payload = {
    title: "Sign Up",
  }

  return res.render(pathResolver.views('auth/sign-up'), payload)
}

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
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
        expiresIn: rememberMe ? '30 days' : '1 day',
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

const logout = async (req, res) => {
  res.clearCookie(process.env.X_ACCESS_TOKEN)
  return res.status(200).json({ message: 'User was successfully logged out.' })
}

const register = async (req, res) => {
  try {
    const user = req.body
    const imageUploads = []
    user.role = 'default-user'

    const requiredFieldsAreNotEmpty = user.firstName && user.lastName && user.email && user.password && user.dateOfBirth

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    const existingUser = await User.findOne({ email: user.email })

    if (existingUser) {
      return res.status(409).json({ error: 'User with such email already exists! Please, choose another email.' })
    }

    user.password = await bcrypt.hash(user.password, 10)

    if (req.files?.profilePicture) {
      const imageName = `${crypto.randomUUID()}.${req.files.profilePicture.name.split('.').pop()}`
      const imagePath = pathResolver.specificFile(`../../public/uploads/images/users/${imageName}`)
      user.profilePicture = imageName
      imageUploads.push(req.files.profilePicture.mv(imagePath))
    }

    const createdUser = await User.create(user)

    if (createdUser) {
      await Promise.all(imageUploads)
      return res.status(200).json({ message: 'User was successfully registered.' })
    }
  } catch (error) {
    console.log(error)
  }

  return res.status(400).json({ error: 'Bad request' })
}

module.exports = { signIn, signUp, login, logout, register }