const router = require('express').Router()
const { listEmployes } = require('../controllers/employes')
const { check } = require('express-validator/check')
const { validateData } = require('../utils')

router.get('/', [
  check('comuna').isNumeric({ min: 1, max: 20 }).optional(),
  check('all').isBoolean().optional(),
  check('skip').isNumeric({ min: 0 }).optional()
], validateData, listEmployes)

module.exports = router
