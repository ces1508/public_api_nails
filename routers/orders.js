const route = require('express').Router()
const { check } = require('express-validator/check')
const { validateData } = require('../utils')
const { create, history } = require('../controllers/orders')

route.get('/', [
  check('page').isNumeric({ min: 1 }).optional()
], history)
route.post('/', [
  check('hour').isString().exists(),
  check('serviceId').isUUID(4).exists(),
  check('employedId').isUUID(4).exists(),
  check('address').isString(),
  check('paymentMethod').isIn(['creditCard', 'cash']).withMessage('debes enviar un metodo de pago valido')
], validateData, create)

module.exports = route
