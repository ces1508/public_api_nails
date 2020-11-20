const Datasource = require('../database')
const { encryptPassword, generateToken } = require('../utils')
const uuid = require('uuid-base62')

const signin = async (req, res) => {
  let { email, password } = req.body
  let userData = await Datasource.sendCrendentialsToLogin(email, password)
  if (userData) {
    if (userData.error) return res.status(500).json({ error: true, message: 'we cant create the user, please try later', fullerror: userData.error })
    let securePassword = await encryptPassword(password, userData.salt)
    if (securePassword.encode === userData.password) {
      let userProfile = await Datasource.getUserProfile(email)
      if (userProfile.error) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR', message: 'we have problmes, please try later' } })
      try {
        let payload = {
          email: userProfile.email
        }
        let token = await generateToken(payload)
        return res.status(201).json({ token })
      } catch (e) {
        return res.status(500).json({ error: { code: 'ERROR_CREATING_TOKEN', message: 'we have problmes, please try later', errorDescription: e.message } })
      }
    }
  }
  res.json({ error: { code: 'INVALID CREDENTIALS', message: 'incorret username or password' } })
}
const register = async (req, res) => {
  let data = req.body
  if (data.id) delete data.id
  try {
    let encode = await encryptPassword(data.password)
    data.password = encode.encode
    data.salt = encode.salt
  } catch (e) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'we have problmes, please try later' } })
  }
  delete data.confirmationPassword
  data.address = []
  let newUser = await Datasource.registerUser(data)
  if (newUser.error) {
    let { error } = newUser
    console.log(error)
    if (error.code === 'USER_ALREADY_EXITS') return res.status(400).json(error)
    return res.status(500).json({ error: true, message: 'we cant create the user, please try later' })
  }
  res.status(201).json({ user: newUser })
}

const addAddress = async (req, res) => {
  let user = req.user
  let newAddress = { ...req.body }
  let profile = await Datasource.getUserProfile(user.email)
  let { address } = profile
  address.push({ ...newAddress, id: uuid.uuid() })
  let action = await Datasource.updateProfile(user.id, { address })
  if (action.replaced >= 1) {
    return res.status(201).json({ status: 'ok', message: 'la dirreccion ha sido agregada con exito' })
  }
  res.json({ error: { message: 'no hemos podido agregar la direccion, por favor intenta mas tarde' } })
}

const updateAddress = async (req, res) => {
  let { id } = req.params
  let user = req.user
  let uAddress = { ...req.body }
  let profile = await Datasource.getUserProfile(user.email)
  let { address } = profile
  let index = address.findIndex(item => item.id === id)
  if (index >= 0) {
    address = [...address.slice(0, index), { ...uAddress, id }, ...address.slice(index + 1)]
    let action = await Datasource.updateProfile(user.id, { address })
    if (action.replaced >= 1 || action.unchanged >= 1) return res.status(200).json({ status: 'ok' })
    res.status(500).json({ error: { message: 'we have problems to update your address list' } })
  } else {
    res.status(404).json({ error: { message: 'cant not find address', code: 404 } })
  }
}

const destroyAddress = async (req, res) => {
  let { id } = req.params
  let user = req.user
  let profile = await Datasource.getUserProfile(user.email)
  let { address } = profile
  let index = address.findIndex(item => item.id === id)
  if (index >= 0) {
    address = [...address.slice(0, index), ...address.slice(index + 1)]
    let action = await Datasource.updateProfile(user.id, { address })
    if (action.replaced >= 1 || action.unchanged >= 1) return res.status(200).json({ status: 'ok' })
  }
  return res.json({ error: { message: 'ocurrio un error, por favor intenta mas tarde' } })
}

const profile = async (req, res) => {
  let { email } = req.user
  let profile = await Datasource.getUserProfile(email)
  if (profile.error) return res.status(500).end()
  if (profile) {
    return res.status(200).json(profile)
  }
  return res.status(403).end()
}

const updateProfile = async (req, res) => {
  let data = req.body
  if (data.password) delete data.password
  if (data.confirmationPassword) delete data.confirmationPassword
  if (data.email) delete data.email
  let userId = req.user.id
  let profile = await Datasource.updateProfile(userId, data)
  if (profile.error) return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' } })
  if (profile.skipped) return res.status(413).send('unAuthorizade')
  if (profile.replaced > 0 || profile.unchanged > 0) return res.json({ status: 'ok' })
  res.status(422).json({ errror: { code: 'INTERNAL_SERVER_ERROR', message: 'we cant update profile' } })
}

const updatePassword = async (req, res) => {
  let data = req.body
  let newData = {}
  let userId = req.user.id
  let currentCredentials = await Datasource.sendCrendentialsToLogin(req.user.email)
  try {
    let currentPassword = encryptPassword(data.password, currentCredentials.salt)
    if (currentPassword.encode !== currentCredentials.password) return res.status(413).json({ error: { code: 'UNAUTHORIZADE' } })
    let securizatePassword = await encryptPassword(data.password)
    newData.salt = securizatePassword.salt
    newData.password = securizatePassword.encode
  } catch (e) {
    return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' } })
  }
  let changePassword = await Datasource.updatePassword(userId, newData)
  if (changePassword.error) return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' } })
  if (changePassword.replaced === 1) return res.json({ status: 'ok' })
  res.status(422).json({ error: { code: 'UNKNOW_ERROR', message: 'we cant upate your credentia' } })
}

const forgetPassword = async (req, res) => {
  let { email } = req.query
  let profile = await Datasource.getUserProfile(email)
  if (profile) {
    if (profile.error) return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'we have problms, please try later' } })
    let token = await generateToken({ email, exp: '1d' })
    // to do send mail with token and url
    return res.json({ status: 'ok', message: 'we send you a email to reset your password' })
  }
  res.status(404).json({ error: { code: 'INVALID_USERNAME', message: 'we cant find your user, please verify your data' } })
}

module.exports = {
  signin,
  register,
  profile,
  updateProfile,
  updatePassword,
  forgetPassword,
  addAddress,
  updateAddress,
  destroyAddress
}
