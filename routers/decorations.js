const router = require('express').Router()
const { list } = require('../controllers/decorations')

router.get('/', list)

module.exports = router
