const route = require('express').Router()
const { check } = require('express-validator/check')
const { validateData } = require('../utils')
const { create, history } = require('../controllers/reservations')

route.get('/', [
  check('page').isNumeric({ min: 1 }).optional(),
  check('state').isIn(['pending', 'end', 'cancel'])
], validateData, history)
route.post('/', [
  check('date').toDate(),
  check('services').isArray().custom(value => {
    for (let service of value) {
      if (!service.hasOwnProperty('id') || !service.hasOwnProperty('amount')) throw new Error('debes enviar un arraglo de objetos, el objeto debe tener las keys [id: uuid, amount: integer]')
      return true
    }
  }),
  check('employedId').isUUID(4).exists(),
  check('address').isUUID(4),
  check('paymentMethod').isIn(['creditCard', 'cash']).withMessage('debes enviar un metodo de pago valido')
], validateData, create)
module.exports = route
