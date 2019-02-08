const { register, signin, updateProfile, updatePassword, forgetPassword, addAddress, updateAddress, destroyAddress } = require('../controllers/user')
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

const addressValidator = [
  check('name').isString().withMessage('debes enviar un nombre con cual identificar la direccion'),
  check('value').isString().withMessage('debes enviar una direccion valida'),
  check('barrio').isString().withMessage('debes enviar el nombre del barrio'),
  check('type').isIn(['house', 'apto']),
  check('comuna').isInt({ min: 1, max: 20 }).optional().withMessage('la comuna no puede ser entre 1 y 20'),
  check('location').custom(value => {
    if (typeof value !== 'object') throw new Error('location debe ser un objecto')
    let keys = Object.keys(value)
    if (!keys.includes('lat') || !keys.includes('long')) throw new Error('debens enviar las propiedades lat y long')
    return true
  })
]

router.post('/address', passport.authenticate('jwt', { session: false }), addressValidator, validateData, addAddress)

router.patch('/address/:id', passport.authenticate('jwt', { session: false }), addressValidator, validateData, updateAddress)
router.delete('/address/:id', passport.authenticate('jwt', { session: false }), [
  check('id').isUUID(4)
], validateData, destroyAddress)
module.exports = router
