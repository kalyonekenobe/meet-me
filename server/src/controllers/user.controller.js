const pathResolver = require("../tools/path-resolver");
const User = require("../models/user.model");
const {notFound} = require("../tools/not-found");
const crypto = require("crypto");
const fs = require("fs");
const bcrypt = require("bcrypt");

const profile = async (req, res) => {
  const payload = {
    title: `Profile`,
    user: req.user
  }

  if (payload.user) {
    return res.render(pathResolver.views('user/profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return notFound(req, res)
}

const details = async (req, res) => {
  try {
    const { id } = req.params
    const payload = {
      title: `User details`,
      user: await User.findById(id)
    }

    if (payload.user) {
      payload.title = `${payload.user.firstName} ${payload.user.lastName}`
      return res.render(pathResolver.views('user/details'), payload)
    }
  } catch (error) {
    console.log(error)
  }

  return notFound(req, res)
}

const editProfile = async (req, res) => {
  const payload = {
    title: `Edit profile`,
    user: req.user
  }

  if (payload.user) {
    return res.render(pathResolver.views('user/edit-profile'), payload)
  }

  console.log('Cannot show profile page because req.user is undefined!')
  return notFound(req, res)
}

const updateProfile = async (req, res) => {
  try {
    const { _id, email } = req.user
    const imageUploads = []

    const user = { ...req.body, _id, email }
    const requiredFieldsAreNotEmpty = user.firstName && user.lastName && user.email && user.password && user.dateOfBirth

    if (!requiredFieldsAreNotEmpty) {
      return res.status(422).json({ error: 'Some of required fields are empty!' })
    }

    user.password = await bcrypt.hash(user.password, 10)

    if (req.files?.profilePicture) {
      const imageName = `${crypto.randomUUID()}.${req.files.profilePicture.name.split('.').pop()}`
      const oldImagePath = pathResolver.specificFile(`../../public/uploads/images/users/${req.files.profilePicture.name}`)
      const newImagePath = pathResolver.specificFile(`../../public/uploads/images/users/${imageName}`)

      if (!fs.existsSync(oldImagePath)) {
        user.profilePicture = imageName
        imageUploads.push(req.files.profilePicture.mv(newImagePath))
      }
    } else {
      user.profilePicture = 'default-user-image.jpg'
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, user)

    if (updatedUser) {
      await Promise.all(imageUploads)
      return res.status(200).json({ message: 'User profile was successfully updated!' })
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(400).json({ error: 'User profile updating error!' })
}

module.exports = { profile, details, editProfile, updateProfile }