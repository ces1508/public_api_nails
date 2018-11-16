const { register, signin, updateProfile, updatePassword, forgetPassword } = require('../controllers/user')
const router = require('express').Router()
const { body, check } = require('express-validator/check')
const { validateData } = require('../utils')
const passport = require('passport')

router.post('/signin', [
  body('email').isEmail().exists(),
  body('password').exists()
], validateData, signin)
router.post('/', [
  body('email').exists().isEmail(),
  body('password').exists().isString(),
  body('firstName').isString().exists().trim(),
  body('lastName').isString().trim(),
  body('address').isString(),
  body('phone').exists().isString(),
  body('confirmationPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('password confirmation dont match')
    return true
  })
], validateData, register)

router.put('/', passport.authenticate('jwt', { session: false }), [
  body('firstName').isString().trim(),
  body('lastName').isString().trim(),
  body('address').isString().optional(),
  body('phone').exists().isString()
], validateData, updateProfile)

router.use('/crendentials', [
  check('password').isString().isLength({ min: 6 }).exists(),
  check('oldPassword').isString().isLength({ min: 6 }).exists()
])
  .patch(validateData, passport.authenticate('jwt', { session: false }), updatePassword)
  .put(validateData, passport.authenticate('jwt', { session: false }), updatePassword)
router.get('/forget_password', [
  check('email').exists().isEmail().withMessage('you need send a valid email addres')
], forgetPassword)
module.exports = router
