const router = require('express').Router()
const { getServices } = require('../controllers/services')
router.get('/', getServices)

module.exports = router
