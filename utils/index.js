const { validationResult } = require('express-validator/check')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Datasource = require('../database')
require('dotenv').config()
const SECRET = process.env.secretToken

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.secretToken

const validateData = (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() })
  next()
}

const encryptPassword = async (text, salt) => {
  if (!salt) {
    salt = await crypto.randomBytes(50)
    salt = salt.toString('hex')
  }
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(text, salt, 100000, 512, 'sha512', (err, derivedKey) => {
      if (err) reject(new Error('error coding password ', err.stack))
      resolve({ salt, encode: derivedKey.toString('hex') })
    })
  })
}

const generateToken = payload => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET, (err, token) => {
      if (err) return reject(new Error(err.stack))
      resolve(token)
    })
  })
}
const strategy = new JwtStrategy(opts, async (payload, done) => {
  if (payload.hasOwnProperty('email')) {
    let profile = await Datasource.getUserProfile(payload.email)
    if (profile.error) return done('unAuthorizade', false)
    return done(null, profile)
  }
  return done('unAuthorizade', false)
})
module.exports = {
  validateData,
  encryptPassword,
  generateToken,
  strategy
}
