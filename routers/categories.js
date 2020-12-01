const router = require('express').Router()
const { getAllCategories } = require('../controllers/categories')
const servicesRouter = require('./services')

router.get('/', getAllCategories)
router.use('/:categoryId/services', servicesRouter)

module.exports = router