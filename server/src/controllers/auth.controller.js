const pathResolver = require('../tools/path-resolver')

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

const login = (req, res) => {

}

const logout = (req, res) => {

}

const register = (req, res) => {

}

module.exports = { signIn, signUp, login, logout, register }