const router = require('express').Router({ mergeParams: true })
const { getServices } = require('../controllers/services')
router.get('/', getServices)

module.exports = router
